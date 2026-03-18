import sys
try:
    import xlrd
    import openpyxl
    print("INSTALADOS")
except ImportError as e:
    print(f"FALTA: {e}")
