// End-to-end smoke test: create a project, save/load it, generate sources and export an Android Studio project.
import path from 'path';
import { installNodeHost } from './nodehost';

const APP = path.resolve(__dirname, '..');
installNodeHost(APP);

async function main() {
  const { Workspace } = await import('../src/core/workspace');
  const { createNewProject } = await import('../src/core/project');
  const { ViewBean, BlockBean, EventBean, ComponentBean } = await import('../src/core/beans');
  const gen = await import('../src/codegen/generator');

  const root = path.join(process.env.TEMP ?? '/tmp', 'swd-test', '.sketchware').replace(/\\/g, '/');
  const ws = new Workspace(root);
  await ws.ensure();
  const id = await ws.newScId();
  const p = createNewProject(id, 'Hello App', 'com.test.hello', 'HelloProject');

  // layout: vertical linear with a TextView and a Button
  const lin = new ViewBean('linear1', 0);
  lin.parent = 'root';
  lin.parentType = -1;
  lin.layout.width = -1;
  lin.layout.height = -1;
  lin.layout.orientation = 1;
  lin.layout.paddingLeft = lin.layout.paddingTop = lin.layout.paddingRight = lin.layout.paddingBottom = 8;
  const tv = new ViewBean('textview1', 4);
  tv.parent = 'linear1';
  tv.parentType = 0;
  tv.index = 0;
  tv.text.text = 'Hello';
  tv.text.textSize = 18;
  tv.text.textColor = 0xff000000 | 0;
  const btn = new ViewBean('button1', 3);
  btn.parent = 'linear1';
  btn.parentType = 0;
  btn.index = 1;
  btn.text.text = 'Click me';
  btn.text.textColor = 0xff000000 | 0;
  p.getViews('main.xml').push(lin, tv, btn);

  p.getVars('MainActivity.java').push([1, 'count']);
  p.getComponents('MainActivity.java').push(new ComponentBean(5, 'timer'));
  p.getEvents('MainActivity.java').push(new EventBean(1, 3, 'button1', 'onClick'));

  const mk = (id: string, op: string, spec: string, type: string, params: string[], next = -1, sub1 = -1) => {
    const b = new BlockBean(id, spec, type, '', op);
    b.parameters = params;
    b.nextBlock = next;
    b.subStack1 = sub1;
    return b;
  };
  // onClick: count++ ; setText(textview1, "Clicked " + count) ; if count > 3 then toast
  p.setBlocks('MainActivity.java', 'button1_onClick', [
    mk('10', 'increaseInt', '%m.varInt increase 1', ' ', ['count'], 11),
    mk('11', 'setText', '%m.textview setText %s', ' ', ['textview1', '@12'], 14),
    mk('12', 'stringJoin', '%s join %s', 's', ['Clicked ', '@13']),
    mk('13', 'toString', '%d to String', 's', ['@15']),
    mk('15', 'getVar', 'count', 'd', []),
    mk('14', 'if', 'if %b then', 'c', ['@16'], -1, 17),
    mk('16', '>', '%d > %d', 'b', ['@18', '3']),
    mk('18', 'getVar', 'count', 'd', []),
    mk('17', 'doToast', 'Toast %s', ' ', ['More than 3!']),
  ]);
  p.setBlocks('MainActivity.java', 'onCreate_initializeLogic', [mk('20', 'setText', '%m.textview setText %s', ' ', ['textview1', 'Ready'])]);

  await ws.saveProject(p);
  const loaded = await ws.loadProject(id);
  console.log('round-trip blocks:', loaded.getBlocks('MainActivity.java', 'button1_onClick').length, 'views:', loaded.getViews('main.xml').length);

  await gen.ensureGeneratorReady(root, (m, e) => console.log(e ? 'ERR' : 'MSG', m));
  const files = gen.generateSourceFiles(loaded, root);
  console.log('generated:', files.map((f) => f.name).join(', '));
  const main = files.find((f) => f.name === 'MainActivity.java');
  console.log('----- MainActivity.java -----\n' + main?.source);
  console.log('----- main.xml -----\n' + files.find((f) => f.name === 'main.xml')?.source);

  const out = path.join(process.env.TEMP ?? '/tmp', 'swd-test', 'HelloProject.zip');
  const res = await gen.exportAndroidStudio(loaded, root, out);
  console.log('exported to', res.projectDir, res.zipPath);

  const swb = await ws.exportSwb(id);
  const id2 = await ws.importSwb(swb);
  const again = await ws.loadProject(id2);
  console.log('swb round-trip:', id2, again.appName, again.getBlocks('MainActivity.java', 'button1_onClick').length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
