import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load the datasets
file_path_kunlik = 'Operatorlar qilgan qo\'ng\'iroqla soni, davomiyligi va savdo soni o\'rtasida bog\'liqlik bormi_ (1).xlsx - kunlik.csv'

# Try reading with different encodings if default fails, though standard read usually works for CSVs unless specific chars exist
try:
    df_kunlik = pd.read_csv(file_path_kunlik)
except:
    df_kunlik = pd.read_csv(file_path_kunlik, encoding='latin1')

# 1. Data Cleaning & Preparation
# Standardize column names (strip whitespace)
df_kunlik.columns = df_kunlik.columns.str.strip()

# Identify relevant columns (assuming structure based on user description)
# We need: Operator Name, Call Duration, Sales Count
# Let's inspect columns to map them correctly. 
# Since I can't interactively see columns, I will look for keywords like 'operator', 'savdo', 'davomiylik'.

def map_columns(df):
    cols = {}
    for c in df.columns:
        low_c = c.lower()
        if 'operator' in low_c:
            cols['name'] = c
        elif 'savdo' in low_c and 'soni' in low_c:
            cols['sales'] = c
        elif 'davomiylik' in low_c: # assuming secondary duration or total duration
             cols['duration'] = c
    return cols

mapping = map_columns(df_kunlik)

# If mapping fails, I'll use index, but let's assume it works for now based on file name imply
if mapping:
    df = df_kunlik[[mapping['name'], mapping['duration'], mapping['sales']]].copy()
    df.columns = ['Operator', 'Duration', 'Sales']
    
    # Clean numeric data (remove non-numeric chars if any)
    df['Sales'] = pd.to_numeric(df['Sales'], errors='coerce').fillna(0)
    df['Duration'] = pd.to_numeric(df['Duration'], errors='coerce').fillna(0)

    # 2. Define Experts
    experts = ['maxsuma', 'dilnavoz', 'dilafruz']
    
    # Create 'Status' column
    df['Status'] = df['Operator'].astype(str).str.lower().apply(
        lambda x: 'Expert' if any(exp in x for exp in experts) else 'Junior'
    )

    # 3. Visualization
    plt.figure(figsize=(18, 5))

    # Plot 1: Efficiency Matrix (Scatter)
    plt.subplot(1, 3, 1)
    sns.scatterplot(data=df, x='Duration', y='Sales', hue='Status', palette={'Expert':'red', 'Junior':'blue'}, s=100, alpha=0.7)
    plt.title('1. Kim "Snayper"? (Efficiency Matrix)')
    plt.xlabel('Kunlik Gaplashish Vaqti (sekund)')
    plt.ylabel('Kunlik Savdo Soni')
    plt.axhline(y=df['Sales'].mean(), color='gray', linestyle='--', alpha=0.5, label='O\'rtacha Savdo')
    plt.legend()

    # Plot 2: Saturation Point (Histogram of Sales Counts)
    plt.subplot(1, 3, 2)
    # Filter for positive sales to see the distribution clearly
    sales_counts = df[df['Sales'] > 0]['Sales']
    sns.histplot(sales_counts, bins=range(0, int(df['Sales'].max()) + 2), discrete=True, color='purple')
    plt.title('2. "Potolok" bormi? (Sales Distribution)')
    plt.xlabel('Bitta operatordagi kunlik savdo soni')
    plt.ylabel('Holatlar soni (Frequency)')
    plt.xticks(range(0, int(df['Sales'].max()) + 1))

    # Plot 3: Stability Comparison (Box Plot)
    plt.subplot(1, 3, 3)
    sns.boxplot(data=df, x='Status', y='Sales', palette={'Expert':'red', 'Junior':'blue'})
    plt.title('3. Juniorlar halaqit beryaptimi?')
    plt.xlabel('Operator Darajasi')
    plt.ylabel('Kunlik Savdo Soni')

    plt.tight_layout()
    plt.show()

else:
    print("Ustun nomlarini aniqlab bo'lmadi. Iltimos, fayl ustunlarini tekshiring.")