from pathlib import Path
import html,re

def inline(text):
    text=html.escape(text)
    text=re.sub(r'`([^`]+)`',r'<code>\1</code>',text)
    text=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',text)
    def link(m):
        dest=m[2]
        if dest.endswith('.md') and '://' not in dest:dest=dest[:-3]+'.html'
        return '<a href="'+dest+'">'+m[1]+'</a>'
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)',link,text)

def render(text):
    out=[];para=[];listing=None;table=False
    def flush():
        if para:out.append('<p>'+inline(' '.join(para))+'</p>');para.clear()
    def close_list():
        nonlocal listing
        if listing:out.append('</'+listing+'>');listing=None
    def close_table():
        nonlocal table
        if table:out.append('</tbody></table>');table=False
    for line in text.splitlines():
        if line.startswith('|'):
            flush();close_list()
            cells=[x.strip() for x in line.strip('|').split('|')]
            if all(re.fullmatch(r':?-+:?',x.replace(' ','')) for x in cells):continue
            if not table:
                out.append('<table><thead><tr>'+''.join('<th>'+inline(c)+'</th>' for c in cells)+'</tr></thead><tbody>');table=True
            else:out.append('<tr>'+''.join('<td>'+inline(c)+'</td>' for c in cells)+'</tr>')
            continue
        close_table()
        if not line.strip():flush();close_list();continue
        match=re.match(r'^(#{1,3}) (.+)$',line)
        if match:
            flush();close_list();n=len(match[1]);out.append(f'<h{n}>'+inline(match[2])+f'</h{n}>');continue
        match=re.match(r'^(\d+\.|-) (.+)$',line)
        if match:
            flush();kind='ul' if match[1]=='-' else 'ol'
            if kind!=listing:close_list();out.append('<'+kind+'>');listing=kind
            out.append('<li>'+inline(match[2])+'</li>');continue
        close_list();para.append(line)
    flush();close_list();close_table()
    return '\n'.join(out)

for path in Path('night-report').glob('*.md'):
    title=path.read_text().splitlines()[0].lstrip('# ')
    page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title><link rel="stylesheet" href="report.css"><main class="'+path.stem+'"><header><a href="index.html">DayBuoy / night-pass</a><span>6 October 2026</span></header>'+render(path.read_text())+'</main></html>'
    path.with_suffix('.html').write_text(page)

Path('night-report/index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DayBuoy · Night pass</title><link rel="stylesheet" href="report.css"><main><header><a href="../">DayBuoy</a><span>Private branch preview</span></header><h1>Your beach. A clearer next step.</h1><p>Ocean tuning, two header directions, coastal dunes and the launch plan. All isolated on <code>night-pass</code>. The main app is unchanged.</p><aside><strong>Start with the phone test.</strong> The latest actual iPhone result is still your earlier ~6 fps. The new 30 fps target is unverified. This environment could run code checks, but could not render the scene or record a phone clip.</aside><section class="report-index"><a href="../ocean-proof/"><strong>01 / Ocean proof</strong><span>Two-minute benchmark · timing clip · full/tuned captures</span></a><a href="../?ocean=webgpu&header=verdict"><strong>02 / In the app</strong><span>Partial native integration with original-water fallback</span></a><a href="design.html"><strong>03 / Header A / B</strong><span>Switch layouts without resetting the beach</span></a><a href="land.html"><strong>04 / Dunes</strong><span>Left, right and behind · on-device still export</span></a></section><div class="links"><a href="morning.html">One-page morning report</a><a href="launch.html">Dated launch checklist</a><a href="migration.html">What still needs a port</a><a href="privacy-draft.html">Privacy draft</a><a href="credits.html">Sources &amp; credits</a><a href="interactions.json">Interaction checks</a><a href="validation.json">Additional checks</a></div><p class="subtle">No new iPhone footage or rendered stills were produced in this environment. Capture controls run on your device. Frame-rate averages alone do not establish sustained performance or visual quality.</p></main></html>''')
