import lasio
import pandas as pd
import matplotlib.pyplot as plt


las_file_path = './test.las'
las = lasio.read(las_file_path)

#print(f"Well Name: {las.well.WELL.value}")
#print(f"Field: {las.well.FLD.value}")

df = las.df()

plt.plot(df.index, df['GR'])
plt.show()