import os
import numpy as np
import pandas as pd

# Set random seed for reproducibility
np.random.seed(42)

n_samples_per_cluster = 50
data = []

# Cluster 1: Low Income, Low Spending
inc_1 = np.random.normal(25, 5, n_samples_per_cluster)
spd_1 = np.random.normal(20, 8, n_samples_per_cluster)

# Cluster 2: Low Income, High Spending
inc_2 = np.random.normal(25, 5, n_samples_per_cluster)
spd_2 = np.random.normal(75, 8, n_samples_per_cluster)

# Cluster 3: High Income, Low Spending
inc_3 = np.random.normal(85, 12, n_samples_per_cluster)
spd_3 = np.random.normal(25, 8, n_samples_per_cluster)

# Cluster 4: High Income, High Spending
inc_4 = np.random.normal(85, 12, n_samples_per_cluster)
spd_4 = np.random.normal(80, 8, n_samples_per_cluster)

incomes = np.concatenate([inc_1, inc_2, inc_3, inc_4])
spendings = np.concatenate([spd_1, spd_2, spd_3, spd_4])

# Clip values to realistic ranges
incomes = np.clip(incomes, 15, 140)
spendings = np.clip(spendings, 1, 99)

genders = np.random.choice(['Male', 'Female'], size=len(incomes), p=[0.45, 0.55])
ages = np.random.randint(18, 70, size=len(incomes))

# Purchase frequency (1 to 50)
freqs = np.random.randint(1, 50, size=len(incomes))

# Revenue and CLV based on income and spending score
revenues = (incomes * 10 * spendings / 100) + np.random.normal(200, 50, size=len(incomes))
revenues = np.clip(revenues, 50, 15000)

clvs = revenues * np.random.uniform(2.5, 4.5, size=len(incomes))

# Dates over the last 12 months
start_date = pd.to_datetime('2025-06-01')
end_date = pd.to_datetime('2026-06-01')
date_range_days = (end_date - start_date).days
random_days = np.random.randint(0, date_range_days, size=len(incomes))
dates = start_date + pd.to_timedelta(random_days, unit='D')

for i in range(len(incomes)):
    data.append({
        'CustomerID': 1000 + i,
        'Gender': genders[i],
        'Age': int(ages[i]),
        'Annual Income (k$)': round(float(incomes[i]), 1),
        'Spending Score (1-100)': int(round(spendings[i])),
        'Purchase Frequency': int(freqs[i]),
        'Revenue': round(float(revenues[i]), 2),
        'CLV': round(float(clvs[i]), 2),
        'Date': dates[i].strftime('%Y-%m-%d')
    })

df = pd.DataFrame(data)

# Create sample_data directory and save
os.makedirs('sample_data', exist_ok=True)
df.to_csv('sample_data/customers.csv', index=False)
print("Sample data generated successfully in sample_data/customers.csv")
