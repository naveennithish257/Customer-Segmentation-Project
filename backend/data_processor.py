"""
data_processor.py — Flexible data loading and preprocessing.
Works with ANY CSV/Excel file, whether or not it has customer-specific columns.
"""
import pandas as pd
import numpy as np
import re

COLUMN_ALIASES = {
    'customerid': ['customerid', 'customer_id', 'id', 'cust_id', 'custid', 'customer id', 'cid'],
    'gender': ['gender', 'sex', 'g'],
    'age': ['age', 'age_years', 'customer_age'],
    'annual_income': [
        'annual income (k$)', 'annual_income', 'income', 'annualincome',
        'annual income', 'yearly_income', 'income_k', 'annual income (usd)',
        'salary', 'earning', 'annual salary', 'wage',
    ],
    'spending_score': [
        'spending score (1-100)', 'spending_score', 'spendingscore',
        'spending score', 'spend_score', 'purchase_score', 'score',
        'loyalty_score', 'loyalty score',
    ],
    'purchase_frequency': [
        'purchase_frequency', 'purchases', 'frequency', 'num_purchases',
        'purchase_count', 'order_count', 'transactions', 'orders',
    ],
    'revenue': [
        'revenue', 'total_revenue', 'total_spend', 'total_purchase',
        'amount', 'sales', 'total_sales', 'purchase_amount', 'spend',
    ],
    'clv': ['clv', 'customer_lifetime_value', 'lifetime_value', 'ltv', 'cltv'],
    'date': ['date', 'join_date', 'created_at', 'signup_date', 'registration_date',
             'purchase_date', 'order_date', 'transaction_date'],
}

GENERIC_CLUSTER_COLORS = ['#00d4ff', '#7c3aed', '#f59e0b', '#ef4444',
                           '#22c55e', '#f43f5e', '#8b5cf6', '#06b6d4']


def normalize_col(name: str) -> str:
    return re.sub(r'[\s\-_]+', '_', name.strip().lower())


def detect_columns(df: pd.DataFrame) -> dict:
    """
    Map canonical column names to actual DataFrame columns.
    Returns as many matches as possible (can be empty dict).
    """
    norm_map = {normalize_col(c): c for c in df.columns}
    mapping = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            key = normalize_col(alias)
            if key in norm_map:
                mapping[canonical] = norm_map[key]
                break
    return mapping


def get_numeric_columns(df: pd.DataFrame) -> list:
    """Return a list of numeric column names (excluding internal/id cols)."""
    skip = {'cluster', 'segment', 'segment_color', 'customerid'}
    return [c for c in df.select_dtypes(include=[np.number]).columns if c not in skip]


def infer_best_cluster_features(df: pd.DataFrame) -> list:
    """
    Pick the best two numeric columns for clustering.
    Prefer annual_income + spending_score. Otherwise pick top-2 highest-variance cols,
    skipping binary columns (only 0/1 values) and low-cardinality columns.
    """
    preferred = ['annual_income', 'spending_score']
    available = [c for c in preferred if c in df.columns and df[c].notna().sum() > 4]
    if len(available) == 2:
        return available

    nums = get_numeric_columns(df)
    if len(nums) < 2:
        return []

    # Filter out binary/boolean columns (unique values <= 2) and low-cardinality (<5 unique)
    good_cols = []
    for col in nums:
        col_data = df[col].dropna()
        if len(col_data) == 0:
            continue
        n_unique = col_data.nunique()
        if n_unique <= 2:          # skip binary flags (0/1, True/False)
            continue
        if n_unique < 5:           # skip very low cardinality
            continue
        good_cols.append(col)

    if len(good_cols) < 2:
        # fall back to all numeric if filtering was too aggressive
        good_cols = nums

    cvs = {}
    for col in good_cols:
        col_data = df[col].dropna()
        if len(col_data) > 0 and col_data.mean() != 0:
            cvs[col] = col_data.std() / abs(col_data.mean())
    top2 = sorted(cvs, key=cvs.get, reverse=True)[:2]
    return top2 if len(top2) == 2 else good_cols[:2]


def load_file(filepath: str) -> pd.DataFrame:
    """Load CSV, Excel, JSON, or Pickle file into DataFrame."""
    ext = filepath.rsplit('.', 1)[-1].lower()
    if ext == 'csv':
        try:
            df = pd.read_csv(filepath, encoding='utf-8', on_bad_lines='skip')
        except UnicodeDecodeError:
            df = pd.read_csv(filepath, encoding='latin-1', on_bad_lines='skip')
    elif ext in ('xlsx', 'xls'):
        df = pd.read_excel(filepath)
    elif ext == 'json':
        try:
            df = pd.read_json(filepath)
        except Exception:
            # Try records-orient fallback
            import json
            with open(filepath, 'r', encoding='utf-8') as f:
                raw = json.load(f)
            if isinstance(raw, list):
                df = pd.DataFrame(raw)
            elif isinstance(raw, dict):
                df = pd.DataFrame([raw]) if not any(isinstance(v, list) for v in raw.values()) else pd.DataFrame(raw)
            else:
                raise ValueError('JSON structure not recognised as tabular data.')
    elif ext in ('pkl', 'pickle'):
        df = pd.read_pickle(filepath)
        if not isinstance(df, pd.DataFrame):
            raise ValueError('Pickle file does not contain a Pandas DataFrame.')
    elif ext == 'ipynb':
        df = _load_ipynb(filepath)
    else:
        raise ValueError(f"Unsupported file type: .{ext}. Supported: CSV, Excel, JSON, Pickle (.pkl), Notebook (.ipynb)")

    df.dropna(how='all', inplace=True)
    df.dropna(axis=1, how='all', inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


def _load_ipynb(filepath: str) -> pd.DataFrame:
    """
    Extract tabular data from a Jupyter Notebook (.ipynb).
    Strategy (in order):
      1. Scan cell outputs for HTML DataFrame tables (text/html)
      2. Scan cell outputs for CSV-like plain text (text/plain)
    Returns the largest table found.
    """
    import json
    from io import StringIO

    with open(filepath, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    cells = nb.get('cells', [])
    candidates = []

    for cell in cells:
        outputs = cell.get('outputs', [])
        for output in outputs:
            # --- HTML output (DataFrame.to_html / display(df)) ---
            html_lines = output.get('data', {}).get('text/html', [])
            if html_lines:
                html_str = ''.join(html_lines) if isinstance(html_lines, list) else html_lines
                try:
                    tables = pd.read_html(StringIO(html_str))
                    for t in tables:
                        if len(t) > 0 and len(t.columns) > 1:
                            # Drop unnamed pandas index columns
                            t = t.loc[:, ~t.columns.astype(str).str.match(r'^Unnamed')]
                            candidates.append(t)
                except Exception:
                    pass

            # --- Plain text output (print(df) or df.to_string()) ---
            plain_lines = output.get('data', {}).get('text/plain',
                          output.get('text', []))
            if plain_lines:
                plain_str = ''.join(plain_lines) if isinstance(plain_lines, list) else plain_lines
                if plain_str.count('\n') > 1 and ('  ' in plain_str or '\t' in plain_str):
                    try:
                        t = pd.read_csv(StringIO(plain_str), sep=r'\s+', engine='python')
                        if len(t) > 0 and len(t.columns) > 1:
                            candidates.append(t)
                    except Exception:
                        pass

    if not candidates:
        raise ValueError(
            'No tabular data found in the notebook. '
            'Make sure at least one cell displays a DataFrame (e.g. display(df) or just df on its own line).'
        )

    return max(candidates, key=lambda t: len(t) * len(t.columns))


def preprocess(df: pd.DataFrame, col_map: dict) -> pd.DataFrame:
    """
    Clean and standardise the data.
    Works even when col_map is empty (any dataset).
    """
    df = df.copy()

    if col_map:
        inv = {v: k for k, v in col_map.items()}
        df.rename(columns=inv, inplace=True)

    # --- Age ---
    if 'age' in df.columns:
        df['age'] = pd.to_numeric(df['age'], errors='coerce')
        valid_ages = df['age'].between(1, 120, inclusive='both')
        if valid_ages.sum() > 0:
            df = df[valid_ages | df['age'].isna()]

    # --- Gender normalisation ---
    if 'gender' in df.columns:
        df['gender'] = df['gender'].astype(str).str.strip().str.title()
        df['gender'] = df['gender'].replace({
            'M': 'Male', 'F': 'Female',
            '0': 'Male', '1': 'Female',
            'Man': 'Male', 'Woman': 'Female',
        })
        df['gender'] = df['gender'].where(df['gender'].isin(['Male', 'Female']), other='Other')

    # --- Annual income ---
    if 'annual_income' in df.columns:
        df['annual_income'] = pd.to_numeric(df['annual_income'], errors='coerce')
        median_val = df['annual_income'].dropna().median()
        if median_val is not None and not np.isnan(median_val) and median_val > 1000:
            df['annual_income'] = df['annual_income'] / 1000
        df = df[df['annual_income'].isna() | (df['annual_income'] > 0)]

    # --- Spending score ---
    if 'spending_score' in df.columns:
        df['spending_score'] = pd.to_numeric(df['spending_score'], errors='coerce')
        max_val = df['spending_score'].dropna().max()
        if max_val is not None and not np.isnan(max_val) and max_val <= 1:
            df['spending_score'] = df['spending_score'] * 100
        df = df[df['spending_score'].isna() | df['spending_score'].between(0, 100, inclusive='both')]

    # --- Purchase frequency ---
    if 'purchase_frequency' in df.columns:
        df['purchase_frequency'] = pd.to_numeric(df['purchase_frequency'], errors='coerce').abs()

    # --- Revenue ---
    if 'revenue' in df.columns:
        df['revenue'] = pd.to_numeric(df['revenue'], errors='coerce').abs()

    # --- CLV ---
    if 'clv' in df.columns:
        df['clv'] = pd.to_numeric(df['clv'], errors='coerce').abs()

    # --- Date ---
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')

    # --- Auto-convert object columns that look numeric ---
    for col in df.select_dtypes(include='object').columns:
        if col in ('gender', 'customerid', 'segment', 'segment_color'):
            continue
        converted = pd.to_numeric(df[col], errors='coerce')
        if converted.notna().mean() > 0.6:
            df[col] = converted

    df.dropna(how='all', inplace=True)
    df.reset_index(drop=True, inplace=True)

    if 'customerid' not in df.columns:
        df.insert(0, 'customerid', range(1, len(df) + 1))

    return df


def compute_kpis(df: pd.DataFrame) -> dict:
    """Compute KPIs from whatever columns are available."""
    num_cols = get_numeric_columns(df)

    kpis = {
        'total_customers': int(len(df)),
        'total_revenue': None,
        'avg_spending_score': None,
        'avg_annual_income': None,
        'retention_rate': None,
        'num_segments': None,
    }

    if 'revenue' in df.columns and df['revenue'].notna().any():
        kpis['total_revenue'] = round(float(df['revenue'].sum()), 2)
    elif 'annual_income' in df.columns and 'spending_score' in df.columns:
        proxy = df['annual_income'].fillna(0) * 1000 * df['spending_score'].fillna(0) / 100
        kpis['total_revenue'] = round(float(proxy.sum()), 2)
    elif num_cols:
        best = max(num_cols, key=lambda c: df[c].dropna().sum() if df[c].dropna().size > 0 else 0)
        kpis['total_revenue'] = round(float(df[best].sum()), 2)

    if 'spending_score' in df.columns and df['spending_score'].notna().any():
        kpis['avg_spending_score'] = round(float(df['spending_score'].mean()), 1)

    if 'annual_income' in df.columns and df['annual_income'].notna().any():
        kpis['avg_annual_income'] = round(float(df['annual_income'].mean()), 1)

    if 'spending_score' in df.columns and df['spending_score'].notna().any():
        retained = (df['spending_score'] >= 50).sum()
        kpis['retention_rate'] = round(float(retained / len(df) * 100), 1)
    elif num_cols:
        col = num_cols[0]
        median = df[col].median()
        retained = (df[col] >= median).sum()
        kpis['retention_rate'] = round(float(retained / len(df) * 100), 1)

    return kpis


def get_age_distribution(df: pd.DataFrame) -> list:
    if 'age' not in df.columns or df['age'].dropna().empty:
        return []
    df = df.copy()
    bins = [0, 18, 25, 35, 45, 55, 65, 200]
    labels = ['<18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    df['age_group'] = pd.cut(df['age'], bins=bins, labels=labels, right=False)
    dist = df['age_group'].value_counts().sort_index().reset_index()
    dist.columns = ['age_group', 'count']
    return dist.to_dict(orient='records')


def get_gender_distribution(df: pd.DataFrame) -> list:
    if 'gender' not in df.columns or df['gender'].dropna().empty:
        return []
    dist = df['gender'].value_counts().reset_index()
    dist.columns = ['gender', 'count']
    return dist.to_dict(orient='records')


def get_purchase_frequency(df: pd.DataFrame) -> list:
    if 'purchase_frequency' not in df.columns or df['purchase_frequency'].dropna().empty:
        return []
    col = df['purchase_frequency'].dropna()
    max_val = col.max()
    if max_val <= 0:
        return []
    bins = sorted(set([0, 5, 10, 20, 50, 100, max_val + 1]))
    labels_all = ['1-5', '6-10', '11-20', '21-50', '51-100', '100+']
    labels = labels_all[:len(bins) - 1]
    df = df.copy()
    df['freq_group'] = pd.cut(df['purchase_frequency'], bins=bins, labels=labels, right=False)
    dist = df['freq_group'].value_counts().sort_index().reset_index()
    dist.columns = ['range', 'count']
    return dist.to_dict(orient='records')
