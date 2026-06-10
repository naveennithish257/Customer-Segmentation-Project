"""
Flask API server for the Customer Segmentation Analytics Dashboard.
All data is derived from the user-uploaded CSV/Excel file.
"""
from __future__ import annotations
import os
import uuid
import json
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

from data_processor import load_file, detect_columns, preprocess, compute_kpis, \
    get_age_distribution, get_gender_distribution, get_purchase_frequency
from clustering import run_kmeans, get_scatter_data, get_segment_summary, \
    get_revenue_by_segment, get_clv_data, get_segment_growth
from ai_insights import generate_insights
from report_generator import export_excel, export_pdf

# ── App setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXT = {'csv', 'xlsx', 'xls', 'json', 'pkl', 'pickle', 'ipynb'}

app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

# ── In-memory session store (single-user) ────────────────────────────────────
SESSION: dict = {
    'df': None,
    'kpis': None,
    'col_map': None,
    'insights': None,
    'segment_summary': None,
}


# ── Helpers ──────────────────────────────────────────────────────────────────

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT


def _convert(obj):
    """JSON-serialise numpy / pandas types."""
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if pd.isna(obj):
        return None
    return obj


def safe_json(data):
    return json.loads(json.dumps(data, default=_convert))


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    is_loaded = SESSION['df'] is not None
    info = None
    if is_loaded:
        info = {
            'rows': len(SESSION['df']),
            'columns_detected': list(SESSION['col_map'].keys()) if SESSION['col_map'] else []
        }
    return jsonify({
        'status': 'ok',
        'data_loaded': is_loaded,
        'info': info
    })


@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    if not allowed_file(f.filename):
        return jsonify({'error': 'Only CSV and Excel files are supported'}), 400

    filename = f"{uuid.uuid4()}_{secure_filename(f.filename)}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    f.save(filepath)

    try:
        df_raw = load_file(filepath)
        col_map = detect_columns(df_raw)

        df = preprocess(df_raw, col_map)

        # Run clustering if possible
        df = run_kmeans(df)

        # Compute everything
        kpis = compute_kpis(df)
        segment_summary = get_segment_summary(df)
        kpis['num_segments'] = len(segment_summary)
        insights = generate_insights(df)

        # Store in session
        SESSION['df'] = df
        SESSION['kpis'] = kpis
        SESSION['col_map'] = col_map
        SESSION['insights'] = insights
        SESSION['segment_summary'] = segment_summary

        # Build column info
        available_cols = list(col_map.keys())

        return jsonify({
            'success': True,
            'rows': len(df),
            'columns_detected': available_cols,
            'kpis': safe_json(kpis),
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            os.remove(filepath)
        except Exception:
            pass


@app.route('/api/kpis', methods=['GET'])
def get_kpis():
    if SESSION['df'] is None:
        return jsonify({'error': 'No data loaded. Please upload a file first.'}), 404
    return jsonify(safe_json(SESSION['kpis']))


@app.route('/api/segments', methods=['GET'])
def get_segments():
    if SESSION['df'] is None:
        return jsonify({'error': 'No data loaded.'}), 404
    df = SESSION['df']
    scatter = get_scatter_data(df)
    summary = SESSION['segment_summary']
    return jsonify(safe_json({'scatter': scatter, 'summary': summary}))


@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    if SESSION['df'] is None:
        return jsonify({'error': 'No data loaded.'}), 404

    df = _apply_filters(SESSION['df'], request.args)

    return jsonify(safe_json({
        'age_distribution': get_age_distribution(df),
        'gender_distribution': get_gender_distribution(df),
        'purchase_frequency': get_purchase_frequency(df),
        'revenue_by_segment': get_revenue_by_segment(df),
        'clv': get_clv_data(df),
        'segment_growth': get_segment_growth(df),
    }))


@app.route('/api/insights', methods=['GET'])
def get_insights():
    if SESSION['df'] is None:
        return jsonify({'error': 'No data loaded.'}), 404
    return jsonify(safe_json(SESSION['insights']))


@app.route('/api/data', methods=['GET'])
def get_data():
    """Return paginated customer table data."""
    if SESSION['df'] is None:
        return jsonify({'error': 'No data loaded.'}), 404

    df = _apply_filters(SESSION['df'], request.args)
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    search = request.args.get('search', '').strip().lower()

    if search:
        mask = df.astype(str).apply(lambda col: col.str.lower().str.contains(search)).any(axis=1)
        df = df[mask]

    total = len(df)
    start = (page - 1) * per_page
    end = start + per_page
    page_df = df.iloc[start:end].drop(columns=[
        'segment_color', 'cluster', 'cluster_x', 'cluster_y', 'cluster_x_label', 'cluster_y_label',
    ], errors='ignore')

    # Convert date columns to string for JSON serialisation
    for col in page_df.select_dtypes(include=['datetime64']).columns:
        page_df[col] = page_df[col].dt.strftime('%Y-%m-%d')

    return jsonify(safe_json({
        'data': page_df.to_dict(orient='records'),
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': max(1, (total + per_page - 1) // per_page),
        'columns': list(page_df.columns),
    }))


@app.route('/api/export/excel', methods=['GET'])
def export_excel_route():
    if SESSION['df'] is None:
        return jsonify({'error': 'No data loaded.'}), 404
    try:
        data = export_excel(SESSION['df'], SESSION['segment_summary'])
        buf = __import__('io').BytesIO(data)
        return send_file(buf, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                         as_attachment=True, download_name='customer_segmentation_report.xlsx')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/export/pdf', methods=['GET'])
def export_pdf_route():
    if SESSION['df'] is None:
        return jsonify({'error': 'No data loaded.'}), 404
    try:
        data = export_pdf(SESSION['df'], SESSION['segment_summary'], SESSION['kpis'])
        buf = __import__('io').BytesIO(data)
        return send_file(buf, mimetype='application/pdf',
                         as_attachment=True, download_name='customer_segmentation_report.pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/load-sample', methods=['POST'])
def load_sample():
    filepath = os.path.join(os.path.dirname(__file__), 'sample_data', 'customers.csv')
    if not os.path.exists(filepath):
        return jsonify({'error': 'Sample file not found. Please generate sample data first.'}), 404
    try:
        df_raw = load_file(filepath)
        col_map = detect_columns(df_raw)
        df = preprocess(df_raw, col_map)
        df = run_kmeans(df)
        kpis = compute_kpis(df)
        segment_summary = get_segment_summary(df)
        kpis['num_segments'] = len(segment_summary)
        insights = generate_insights(df)
        SESSION['df'] = df
        SESSION['kpis'] = kpis
        SESSION['col_map'] = col_map
        SESSION['insights'] = insights
        SESSION['segment_summary'] = segment_summary
        available_cols = list(col_map.keys())
        return jsonify({
            'success': True,
            'rows': len(df),
            'columns_detected': available_cols,
            'kpis': safe_json(kpis),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/clear', methods=['POST'])
def clear_data():
    for key in SESSION:
        SESSION[key] = None
    return jsonify({'success': True})


# ── Filter helper ────────────────────────────────────────────────────────────

def _apply_filters(df: pd.DataFrame, args) -> pd.DataFrame:
    df = df.copy()

    age_min = args.get('age_min')
    age_max = args.get('age_max')
    gender = args.get('gender')
    income_min = args.get('income_min')
    income_max = args.get('income_max')
    spending_min = args.get('spending_min')
    spending_max = args.get('spending_max')
    segment = args.get('segment')
    date_from = args.get('date_from')
    date_to = args.get('date_to')

    if 'age' in df.columns:
        if age_min:
            df = df[df['age'] >= float(age_min)]
        if age_max:
            df = df[df['age'] <= float(age_max)]

    if 'gender' in df.columns and gender and gender != 'All':
        df = df[df['gender'] == gender]

    if 'annual_income' in df.columns:
        if income_min:
            df = df[df['annual_income'] >= float(income_min)]
        if income_max:
            df = df[df['annual_income'] <= float(income_max)]

    if 'spending_score' in df.columns:
        if spending_min:
            df = df[df['spending_score'] >= float(spending_min)]
        if spending_max:
            df = df[df['spending_score'] <= float(spending_max)]

    if 'segment' in df.columns and segment and segment != 'All':
        df = df[df['segment'] == segment]

    if 'date' in df.columns:
        if date_from:
            df = df[df['date'] >= pd.to_datetime(date_from)]
        if date_to:
            df = df[df['date'] <= pd.to_datetime(date_to)]

    return df


# ── Entry point ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
