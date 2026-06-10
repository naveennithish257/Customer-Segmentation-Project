"""PDF and Excel report generator."""
from __future__ import annotations
import io
import pandas as pd
from datetime import datetime

# ── Excel export ──────────────────────────────────────────────────────────────

def export_excel(df: pd.DataFrame, segment_summary: list) -> bytes:
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine='openpyxl') as writer:
        # Sheet 1: Raw customer data
        export_df = df.drop(columns=[
            'segment_color', 'cluster', 'cluster_x', 'cluster_y', 'cluster_x_label', 'cluster_y_label',
        ], errors='ignore')
        export_df.to_excel(writer, sheet_name='Customer Data', index=False)

        # Sheet 2: Segment Summary
        if segment_summary:
            seg_df = pd.DataFrame(segment_summary).drop(columns=['color'], errors='ignore')
            seg_df.to_excel(writer, sheet_name='Segment Summary', index=False)

        # Sheet 3: Statistics
        numeric_cols = export_df.select_dtypes(include='number')
        if not numeric_cols.empty:
            stats = numeric_cols.describe().T
            stats.to_excel(writer, sheet_name='Statistics')

    buf.seek(0)
    return buf.read()


# ── PDF export ─────────────────────────────────────────────────────────────────

def export_pdf(df: pd.DataFrame, segment_summary: list, kpis: dict) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    )

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)

    styles = getSampleStyleSheet()
    dark_blue = colors.HexColor('#0a1628')
    accent = colors.HexColor('#00d4ff')
    purple = colors.HexColor('#7c3aed')
    white = colors.white
    light_gray = colors.HexColor('#e2e8f0')
    mid_gray = colors.HexColor('#94a3b8')

    title_style = ParagraphStyle('Title', parent=styles['Title'],
                                 textColor=dark_blue, fontSize=22, spaceAfter=4)
    sub_style = ParagraphStyle('Sub', parent=styles['Normal'],
                               textColor=mid_gray, fontSize=10, spaceAfter=16)
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'],
                              textColor=dark_blue, fontSize=14, spaceBefore=12, spaceAfter=6)

    story = []

    # Header
    story.append(Paragraph('Customer Segmentation Report', title_style))
    story.append(Paragraph(f'Generated on {datetime.now().strftime("%d %B %Y, %H:%M")}', sub_style))
    story.append(HRFlowable(width='100%', thickness=2, color=accent, spaceAfter=12))

    # KPI section
    story.append(Paragraph('Key Performance Indicators', h2_style))
    kpi_data = [
        ['Metric', 'Value'],
        ['Total Customers', f"{kpis.get('total_customers', 'N/A'):,}"],
        ['Total Revenue', f"${kpis.get('total_revenue', 0):,.0f}"],
        ['Avg Spending Score', str(kpis.get('avg_spending_score', 'N/A'))],
        ['Avg Annual Income', f"${kpis.get('avg_annual_income', 0):.1f}k"],
        ['Customer Retention Rate', f"{kpis.get('retention_rate', 'N/A')}%"],
        ['Number of Segments', str(kpis.get('num_segments', 'N/A'))],
    ]
    kpi_table = Table(kpi_data, colWidths=[9*cm, 8*cm])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), dark_blue),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [light_gray, white]),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, mid_gray),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 0.5*cm))

    # Segment summary
    if segment_summary:
        story.append(Paragraph('Customer Segment Analysis', h2_style))
        seg_cols = ['segment', 'count', 'pct', 'avg_income', 'avg_spending', 'total_revenue']
        headers = ['Segment', 'Customers', '%', 'Avg Income (k$)', 'Avg Spending', 'Revenue ($)']
        seg_data = [headers]
        for s in segment_summary:
            row = [
                s.get('segment', ''),
                str(s.get('count', '')),
                f"{s.get('pct', '')}%",
                f"{s.get('avg_income', 'N/A')}",
                f"{s.get('avg_spending', 'N/A')}",
                f"{s.get('total_revenue', 0):,.0f}" if s.get('total_revenue') else 'N/A',
            ]
            seg_data.append(row)

        col_widths = [5.5*cm, 2.5*cm, 1.8*cm, 3*cm, 3*cm, 3.2*cm]
        seg_table = Table(seg_data, colWidths=col_widths)
        seg_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), purple),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [light_gray, white]),
            ('GRID', (0, 0), (-1, -1), 0.5, mid_gray),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(seg_table)
        story.append(Spacer(1, 0.5*cm))

    # Customer data sample (first 20 rows)
    story.append(Paragraph('Customer Data Sample (first 20 rows)', h2_style))
    sample = df.drop(columns=[
        'segment_color', 'cluster', 'cluster_x', 'cluster_y', 'cluster_x_label', 'cluster_y_label',
    ], errors='ignore').head(20)
    col_list = list(sample.columns)
    table_data = [col_list] + sample.values.tolist()
    col_w = max(1.5, 17 / max(len(col_list), 1))
    data_table = Table(table_data, colWidths=[col_w*cm] * len(col_list), repeatRows=1)
    data_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), dark_blue),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [light_gray, white]),
        ('GRID', (0, 0), (-1, -1), 0.3, mid_gray),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('WORDWRAP', (0, 0), (-1, -1), True),
    ]))
    story.append(data_table)

    doc.build(story)
    buf.seek(0)
    return buf.read()
