"""
clustering.py — K-Means clustering with adaptive column selection.
Works with any dataset by auto-detecting the best features to cluster on.
"""
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from data_processor import infer_best_cluster_features, GENERIC_CLUSTER_COLORS

SEGMENT_LABELS = {
    'high_income_high_spending': 'High Income – High Spending',
    'high_income_low_spending': 'High Income – Low Spending',
    'low_income_high_spending': 'Low Income – High Spending',
    'low_income_low_spending': 'Low Income – Low Spending',
}

SEGMENT_COLORS = {
    'High Income – High Spending': '#00d4ff',
    'High Income – Low Spending': '#7c3aed',
    'Low Income – High Spending': '#f59e0b',
    'Low Income – Low Spending': '#ef4444',
}


def _label_classic_segments(centers, feature_cols, medians):
    """Label segments using High/Low language for income+spending."""
    cluster_to_segment = {}
    inc_med, spd_med = medians
    for i, center in enumerate(centers):
        inc, spd = center[0], center[1]
        if inc >= inc_med and spd >= spd_med:
            cluster_to_segment[i] = 'High Income – High Spending'
        elif inc >= inc_med and spd < spd_med:
            cluster_to_segment[i] = 'High Income – Low Spending'
        elif inc < inc_med and spd >= spd_med:
            cluster_to_segment[i] = 'Low Income – High Spending'
        else:
            cluster_to_segment[i] = 'Low Income – Low Spending'
    return cluster_to_segment


def _label_generic_segments(n):
    """Generic segment labels (Segment A, B, C…) when columns aren't income/spending."""
    names = ['Segment A', 'Segment B', 'Segment C', 'Segment D',
             'Segment E', 'Segment F', 'Segment G', 'Segment H']
    return {i: names[i] for i in range(n)}


def run_kmeans(df: pd.DataFrame, n_clusters: int = 4) -> pd.DataFrame:
    """
    Run K-Means clustering on the best available numeric features.
    Falls back gracefully to 'Uncategorised' if not enough data.
    """
    feature_cols = infer_best_cluster_features(df)

    if len(feature_cols) < 2:
        df = df.copy()
        df['cluster'] = 0
        df['segment'] = 'Uncategorised'
        df['segment_color'] = '#64748b'
        df['cluster_x'] = None
        df['cluster_y'] = None
        return df

    features = df[feature_cols].dropna()
    if len(features) < n_clusters:
        df = df.copy()
        df['cluster'] = 0
        df['segment'] = 'Uncategorised'
        df['segment_color'] = '#64748b'
        df['cluster_x'] = df.get(feature_cols[0])
        df['cluster_y'] = df.get(feature_cols[1])
        return df

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    km = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    centers = scaler.inverse_transform(km.cluster_centers_)

    # Determine labelling strategy
    using_classic = (feature_cols[0] == 'annual_income' and feature_cols[1] == 'spending_score')
    if using_classic:
        medians = (features['annual_income'].median(), features['spending_score'].median())
        cluster_to_segment = _label_classic_segments(centers, feature_cols, medians)
        color_map = SEGMENT_COLORS
    else:
        cluster_to_segment = _label_generic_segments(n_clusters)
        color_map = {cluster_to_segment[i]: GENERIC_CLUSTER_COLORS[i % len(GENERIC_CLUSTER_COLORS)]
                     for i in range(n_clusters)}

    df = df.copy()
    df['cluster'] = pd.Series(labels, index=features.index)
    df['segment'] = df['cluster'].map(cluster_to_segment).fillna('Uncategorised')
    df['segment_color'] = df['segment'].map(color_map).fillna('#64748b')
    # Store the cluster axes for the scatter plot
    df['cluster_x'] = df.get(feature_cols[0])
    df['cluster_y'] = df.get(feature_cols[1])
    df['cluster_x_label'] = feature_cols[0].replace('_', ' ').title()
    df['cluster_y_label'] = feature_cols[1].replace('_', ' ').title()
    return df


def get_scatter_data(df: pd.DataFrame) -> list:
    """Return scatter plot points: cluster_x vs cluster_y, coloured by segment."""
    needed = {'segment', 'segment_color'}
    if not needed.issubset(df.columns):
        return []

    x_col = 'cluster_x' if 'cluster_x' in df.columns else 'annual_income'
    y_col = 'cluster_y' if 'cluster_y' in df.columns else 'spending_score'

    if x_col not in df.columns or y_col not in df.columns:
        return []

    rows = df[[x_col, y_col, 'segment', 'segment_color']].copy()
    rows = rows.dropna(subset=[x_col, y_col])
    rows = rows.rename(columns={x_col: 'x', y_col: 'y'})

    x_label = df.get('cluster_x_label', pd.Series(['X'] * len(df))).iloc[0] if 'cluster_x_label' in df.columns else x_col.replace('_', ' ').title()
    y_label = df.get('cluster_y_label', pd.Series(['Y'] * len(df))).iloc[0] if 'cluster_y_label' in df.columns else y_col.replace('_', ' ').title()

    if 'customerid' in df.columns:
        rows['customerid'] = df.loc[rows.index, 'customerid']
    if 'age' in df.columns:
        rows['age'] = df.loc[rows.index, 'age']

    result = rows.to_dict(orient='records')
    # Add axis labels as metadata in the first record
    if result:
        result[0]['x_label'] = x_label
        result[0]['y_label'] = y_label
    return result


def get_segment_summary(df: pd.DataFrame) -> list:
    """Aggregate stats per segment."""
    if 'segment' not in df.columns:
        return []

    summary = []
    all_colors = SEGMENT_COLORS.copy()
    for i, (seg_name, grp) in enumerate(df.groupby('segment')):
        color = grp['segment_color'].iloc[0] if 'segment_color' in grp.columns else GENERIC_CLUSTER_COLORS[i % len(GENERIC_CLUSTER_COLORS)]
        rec = {
            'segment': seg_name,
            'color': color,
            'count': int(len(grp)),
            'pct': round(len(grp) / len(df) * 100, 1),
        }
        if 'annual_income' in grp.columns:
            rec['avg_income'] = round(float(grp['annual_income'].mean()), 1)
        if 'spending_score' in grp.columns:
            rec['avg_spending'] = round(float(grp['spending_score'].mean()), 1)
        if 'age' in grp.columns:
            rec['avg_age'] = round(float(grp['age'].mean()), 1)
        if 'revenue' in grp.columns and grp['revenue'].notna().any():
            rec['total_revenue'] = round(float(grp['revenue'].sum()), 2)
        elif 'annual_income' in grp.columns and 'spending_score' in grp.columns:
            proxy = grp['annual_income'].fillna(0) * 1000 * grp['spending_score'].fillna(0) / 100
            rec['total_revenue'] = round(float(proxy.sum()), 2)
        elif 'cluster_x' in grp.columns and grp['cluster_x'].notna().any():
            rec['total_revenue'] = round(float(grp['cluster_x'].fillna(0).sum()), 2)
        summary.append(rec)
    return summary


def get_revenue_by_segment(df: pd.DataFrame) -> list:
    """Revenue contribution per segment for bar/pie chart."""
    summary = get_segment_summary(df)
    total = sum(s.get('total_revenue', 0) or 0 for s in summary)
    for s in summary:
        rev = s.get('total_revenue', 0) or 0
        s['revenue_pct'] = round(rev / total * 100, 1) if total else 0
    return summary


def get_clv_data(df: pd.DataFrame) -> list:
    """Customer Lifetime Value distribution by segment."""
    if 'segment' not in df.columns:
        return []

    if 'clv' in df.columns and df['clv'].notna().any():
        col = 'clv'
    elif 'annual_income' in df.columns and 'spending_score' in df.columns:
        df = df.copy()
        df['clv'] = df['annual_income'].fillna(0) * 1000 * df['spending_score'].fillna(0) / 100 * 3
        col = 'clv'
    elif 'revenue' in df.columns and df['revenue'].notna().any():
        df = df.copy()
        df['clv'] = df['revenue'] * 3
        col = 'clv'
    else:
        return []

    result = []
    for seg, grp in df.groupby('segment'):
        color = grp['segment_color'].iloc[0] if 'segment_color' in grp.columns else '#64748b'
        result.append({
            'segment': seg,
            'color': color,
            'avg_clv': round(float(grp[col].mean()), 2),
            'max_clv': round(float(grp[col].max()), 2),
            'min_clv': round(float(grp[col].min()), 2),
        })
    return result


def get_segment_growth(df: pd.DataFrame) -> list:
    """Monthly segment growth if date column exists."""
    if 'date' not in df.columns or 'segment' not in df.columns:
        return []

    df2 = df.dropna(subset=['date', 'segment']).copy()
    if df2.empty:
        return []
    df2['month'] = df2['date'].dt.to_period('M').astype(str)
    grouped = df2.groupby(['month', 'segment']).size().reset_index(name='count')
    months = sorted(grouped['month'].unique())
    segments = grouped['segment'].unique()

    result = []
    for m in months:
        row = {'month': m}
        for seg in segments:
            val = grouped[(grouped['month'] == m) & (grouped['segment'] == seg)]['count']
            row[seg] = int(val.values[0]) if len(val) else 0
        result.append(row)
    return result
