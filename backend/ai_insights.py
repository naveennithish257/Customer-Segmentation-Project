"""
Rule-based AI insights generator.
Analyses cluster statistics from the processed DataFrame and produces
structured insight cards that look like premium AI-generated content.
"""
from __future__ import annotations
import numpy as np
import pandas as pd

SEGMENT_STRATEGIES = {
    'High Income – High Spending': {
        'icon': '💎',
        'badge': 'VIP',
        'badge_color': '#00d4ff',
        'title': 'High Income – High Spending Champions',
        'behavior': (
            'These customers are your most valuable asset. They earn well and spend freely, '
            'showing strong brand affinity and high purchase frequency. Retention is critical.'
        ),
        'strategy': [
            'Launch exclusive VIP loyalty programs with early product access.',
            'Offer premium bundles and personalised upsell recommendations.',
            'Send personalised thank-you communications and anniversary offers.',
            'Prioritise white-glove customer support to maximise satisfaction.',
        ],
        'churn_risk': 'Low',
        'loyalty_potential': 'Very High',
    },
    'High Income – Low Spending': {
        'icon': '🎯',
        'badge': 'Opportunity',
        'badge_color': '#7c3aed',
        'title': 'High Income – Low Spending Prospects',
        'behavior': (
            'These customers have high purchasing power but are not spending proportionally. '
            'They may be comparison shoppers or simply unaware of your premium offerings.'
        ),
        'strategy': [
            'Target with premium product showcases and curated recommendations.',
            'Introduce a premium membership tier with exclusive perks.',
            'Deploy win-back campaigns highlighting value propositions.',
            'Use A/B tested email campaigns with lifestyle-focused messaging.',
        ],
        'churn_risk': 'Medium',
        'loyalty_potential': 'High',
    },
    'Low Income – High Spending': {
        'icon': '🔥',
        'badge': 'Engaged',
        'badge_color': '#f59e0b',
        'title': 'Low Income – High Spending Enthusiasts',
        'behavior': (
            'These customers are highly engaged and passionate about your brand despite budget '
            'constraints. They are deal-seekers and loyalty programme enthusiasts.'
        ),
        'strategy': [
            'Design budget-friendly loyalty rewards and cashback programmes.',
            'Offer instalment payment options to lower purchase barriers.',
            'Highlight clearance sales and value-for-money promotions.',
            'Gamify their shopping experience with points and achievement badges.',
        ],
        'churn_risk': 'Medium',
        'loyalty_potential': 'Medium',
    },
    'Low Income – Low Spending': {
        'icon': '📈',
        'badge': 'Growth',
        'badge_color': '#ef4444',
        'title': 'Low Income – Low Spending Segment',
        'behavior': (
            'This segment represents customers with lower engagement. They may be price-sensitive '
            'casual buyers who need stronger value propositions to deepen their relationship.'
        ),
        'strategy': [
            'Create entry-level products and micro-purchase options.',
            'Run referral programmes to leverage word-of-mouth growth.',
            'Use re-engagement email sequences with introductory discounts.',
            'Educate on product value through content marketing.',
        ],
        'churn_risk': 'High',
        'loyalty_potential': 'Low',
    },
}


def _safe_round(val, decimals=1):
    try:
        return round(float(val), decimals)
    except Exception:
        return None


def generate_insights(df: pd.DataFrame) -> dict:
    """Generate a full insights payload from the processed dataframe."""
    insights = {
        'summary': _generate_summary(df),
        'segments': _generate_segment_insights(df),
        'high_value_customers': _get_high_value_customers(df),
        'churn_risks': _get_churn_risk_customers(df),
        'loyalty_predictions': _get_loyalty_predictions(df),
    }
    return insights


def _generate_summary(df: pd.DataFrame) -> dict:
    total = len(df)
    summary = {'total_customers': total}

    if 'spending_score' in df.columns:
        avg_spend = df['spending_score'].mean()
        summary['avg_spending_score'] = _safe_round(avg_spend)
        summary['high_engagers_pct'] = _safe_round((df['spending_score'] >= 60).sum() / total * 100)

    if 'annual_income' in df.columns:
        summary['avg_income'] = _safe_round(df['annual_income'].mean())

    if 'age' in df.columns:
        summary['avg_age'] = _safe_round(df['age'].mean())
        summary['dominant_age_group'] = _get_dominant_age_group(df)

    if 'gender' in df.columns:
        gender_counts = df['gender'].value_counts()
        summary['dominant_gender'] = gender_counts.index[0] if len(gender_counts) else 'N/A'
        summary['gender_split'] = gender_counts.to_dict()

    if 'segment' in df.columns:
        seg_counts = df['segment'].value_counts()
        summary['largest_segment'] = seg_counts.index[0] if len(seg_counts) else 'N/A'
        summary['smallest_segment'] = seg_counts.index[-1] if len(seg_counts) else 'N/A'

    return summary


def _get_dominant_age_group(df: pd.DataFrame) -> str:
    bins = [0, 18, 25, 35, 45, 55, 65, 100]
    labels = ['<18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    groups = pd.cut(df['age'], bins=bins, labels=labels, right=False)
    return str(groups.value_counts().idxmax()) if not groups.empty else 'N/A'


def _generate_segment_insights(df: pd.DataFrame) -> list:
    if 'segment' not in df.columns:
        return []

    results = []
    for seg_name, grp in df.groupby('segment'):
        template = SEGMENT_STRATEGIES.get(seg_name, {
            'icon': '📊', 'badge': 'Segment', 'badge_color': '#64748b',
            'title': seg_name, 'behavior': 'Analysed segment.',
            'strategy': ['Engage with targeted communications.'],
            'churn_risk': 'Unknown', 'loyalty_potential': 'Unknown',
        })

        stats = {
            'count': int(len(grp)),
            'pct': _safe_round(len(grp) / len(df) * 100),
        }
        if 'annual_income' in grp.columns:
            stats['avg_income'] = _safe_round(grp['annual_income'].mean())
        if 'spending_score' in grp.columns:
            stats['avg_spending'] = _safe_round(grp['spending_score'].mean())
        if 'age' in grp.columns:
            stats['avg_age'] = _safe_round(grp['age'].mean())
        if 'revenue' in grp.columns:
            stats['total_revenue'] = _safe_round(grp['revenue'].sum(), 2)
        elif 'annual_income' in grp.columns and 'spending_score' in grp.columns:
            proxy = grp['annual_income'] * 1000 * grp['spending_score'] / 100
            stats['total_revenue'] = _safe_round(proxy.sum(), 2)

        results.append({**template, 'stats': stats, 'segment': seg_name})

    return results


def _get_high_value_customers(df: pd.DataFrame, top_n: int = 10) -> list:
    if 'annual_income' not in df.columns or 'spending_score' not in df.columns:
        return []
    df2 = df.copy()
    df2['value_score'] = df2['annual_income'] * df2['spending_score']
    top = df2.nlargest(top_n, 'value_score')
    cols = [c for c in ['customerid', 'age', 'gender', 'annual_income', 'spending_score', 'segment', 'value_score'] if c in top.columns]
    return top[cols].to_dict(orient='records')


def _get_churn_risk_customers(df: pd.DataFrame, top_n: int = 10) -> list:
    """High income, very low spending = risk of switching."""
    if 'annual_income' not in df.columns or 'spending_score' not in df.columns:
        return []
    df2 = df.copy()
    df2['churn_score'] = df2['annual_income'] * (100 - df2['spending_score'])
    at_risk = df2.nlargest(top_n, 'churn_score')
    cols = [c for c in ['customerid', 'age', 'gender', 'annual_income', 'spending_score', 'segment'] if c in at_risk.columns]
    return at_risk[cols].to_dict(orient='records')


def _get_loyalty_predictions(df: pd.DataFrame, top_n: int = 10) -> list:
    """Low income, high spending = highly loyal brand advocates."""
    if 'spending_score' not in df.columns:
        return []
    df2 = df.copy()
    loyal = df2[df2['spending_score'] >= df2['spending_score'].quantile(0.75)]
    cols = [c for c in ['customerid', 'age', 'gender', 'annual_income', 'spending_score', 'segment'] if c in loyal.columns]
    return loyal[cols].head(top_n).to_dict(orient='records')
