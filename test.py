import pandas as pd

with open('out.txt', 'w') as f:
    try:
        df1 = pd.read_html('articulos.xls', decimal=',', thousands='.')[0]
        f.write('articulos.xls cols: ' + str(df1.columns.tolist()) + '\n')
    except Exception as e:
        f.write('articulos.xls html error: ' + str(e) + '\n')
        
        try:
            df3 = pd.read_csv('articulos.xls', delimiter='\t')
            f.write('articulos.xls tsv cols: ' + str(df3.columns.tolist()) + '\n')
        except Exception as e:
            f.write('articulos.xls tsv error: ' + str(e) + '\n')
            
            try:
                df4 = pd.read_excel('articulos.xls')
                f.write('articulos.xls excel cols: ' + str(df4.columns.tolist()) + '\n')
            except Exception as e:
                f.write('articulos.xls excel error: ' + str(e) + '\n')

    try:
        df2 = pd.read_excel('articulos_stock_proveedores.xlsx')
        f.write('articulos_stock_proveedores.xlsx cols: ' + str(df2.columns.tolist()) + '\n')
    except Exception as e:
        f.write('articulos_stock_proveedores.xlsx error: ' + str(e) + '\n')
