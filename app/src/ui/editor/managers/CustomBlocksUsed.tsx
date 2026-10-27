// See Custom Blocks: the user blocks this project's logic uses.
import React from 'react';
import { ProjectStore } from '../store';
import { Page, EmptyState } from '../../common/m3';
import { mount } from '../../common/dialogs';
import { BlockPreview } from '../../logic/BlockPreview';
import { CodePage } from '../CodePage';

export function CustomBlocksUsed(props: { store: ProjectStore; onClose: () => void }) {
  const used = props.store.usedCustomBlocks();
  return (
    <Page title="Used Custom Blocks" subtitle={`${used.length} blocks`} onClose={props.onClose}>
      {used.length === 0 && <EmptyState icon="ic_mtrl_block" text="This project doesn't use any custom blocks." />}
      <div className="card-list">
        {used.map((b) => (
          <div
            key={b.name}
            className="list-row"
            style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}
            onClick={() => mount((c) => <CodePage title={b.name} subtitle="Block code" text={String(b.code ?? '')} lang="java" onClose={c} />)}
          >
            <div className="lr-title mono">{b.name}</div>
            <BlockPreview spec={b.spec} type={b.type} typeName={b.typeName} color={b.color} spec2={b.spec2} maxWidth={900} />
          </div>
        ))}
      </div>
    </Page>
  );
}
