import importlib.util
p = r"c:/Users/ICT-05/Desktop/jstest/art_genenerator/CIA-GUI.py"
spec = importlib.util.spec_from_file_location("cia_gui", p)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
app = m.CIAGuiApp()
print("instantiated")
app.run(headless=True)
print("run ok")
