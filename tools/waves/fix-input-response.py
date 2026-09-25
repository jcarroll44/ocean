"""Apply the two independent input fixes without rebuilding older pending passes."""
from pathlib import Path
import re,argparse

root = Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--input');a=p.parse_args()
page = Path(a.input) if a.input else root / 'index.html'
source = page.read_text()

def edit_module(name, fn):
    global source
    pattern = r'(/\* ===== ' + re.escape(name) + r' ===== \*/)(.*?)(?=/\* ===== |</script>)'
    match = re.search(pattern, source, re.S)
    assert match, name
    source = source[:match.start(2)] + fn(match[2]) + source[match.end(2):]

def spectrum(s):
    if 'const heading = -direction;' in s:
        return s
    start = s.index('  // Camera faces south')
    end = s.index('  const modes = [];', start)
    return s[:start] + '''  // Local beach frame: +X is camera-right alongshore, +Z is shoreward.
  // direction is meteorological FROM bearing minus SITE.facing (201 degrees
  // at Inlet Beach). Source-to-travel conversion is independent of height.
  const heading = -direction;
''' + s[end:]

def populations(s):
    if 'return 1-Math.exp(-speed*speed);' in s:
        return s
    start = s.index('// uWindDirection')
    end = s.index('function windResponse', start)
    return s[:start] + '''// uWindDirection is (meteorological FROM bearing - SITE.facing), radians.
// Light wind produces small waves smoothly; zero wind adds no local wind sea.
// This is an amplitude response, not a claim to resolve fetch or duration.
function windActivation(knots){
 const speed=Math.max(0,knots)/5;
 return 1-Math.exp(-speed*speed);
}
''' + s[end:]

edit_module('wave-spectrum.js', spectrum)
edit_module('wave-populations.js', populations)
page.write_text(source)
print('Applied height-independent direction and continuous light-wind response.')
