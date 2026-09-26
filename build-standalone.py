"""Build a portable HTML copy with all runtime code and assets inlined."""
from pathlib import Path
import base64,re
root=Path(__file__).resolve().parent
html=(root/'index.html').read_text()
html=re.sub(r'<link rel="manifest" href="\./manifest.json"\s*/?>','',html)
html=re.sub(r'<link rel="stylesheet" href="\./styles.css"\s*/?>',lambda _: '<style>'+(root/'styles.css').read_text()+'</style>',html)
icon='data:image/png;base64,'+base64.b64encode((root/'assets/icon-192.png').read_bytes()).decode()
html=html.replace('./assets/icon-192.png',icon)
html=html.replace('<script src="./data/drills.js"></script>','<script>window.SINGLE_FILE=true;</script><script src="./data/drills.js"></script>')
html=re.sub(r'<script src="\./([^\"]+)"></script>',lambda m:'<script>\n'+(root/m[1]).read_text().replace('</script>','<\\/script>')+'\n</script>',html)
(root/'8U-Coach.html').write_text(html)
print('Built 8U-Coach.html')
