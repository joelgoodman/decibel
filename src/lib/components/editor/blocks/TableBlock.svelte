<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TableBlockData } from '../../../types/editor';
  import Button from '../../common/Button.svelte';
  
  export let value: TableBlockData;
  export let readOnly = false;

  const dispatch = createEventDispatcher();

  function handleChange(updates: Partial<TableBlockData>) {
    dispatch('change', { ...value, ...updates });
  }

  function addRow() {
    const newRow = Array(value.rows[0]?.length || 1).fill('');
    handleChange({
      rows: [...value.rows, newRow]
    });
  }

  function addColumn() {
    handleChange({
      rows: value.rows.map(row => [...row, ''])
    });
  }

  function removeRow(index: number) {
    const newRows = [...value.rows];
    newRows.splice(index, 1);
    handleChange({ rows: newRows });
  }

  function removeColumn(index: number) {
    handleChange({
      rows: value.rows.map(row => {
        const newRow = [...row];
        newRow.splice(index, 1);
        return newRow;
      })
    });
  }

  function updateCell(rowIndex: number, colIndex: number, content: string) {
    const newRows = [...value.rows];
    newRows[rowIndex][colIndex] = content;
    handleChange({ rows: newRows });
  }
</script>

<div class="table-block">
  {#if !readOnly}
    <div class="controls">
      <div class="options">
        <label class="checkbox">
          <input
            type="checkbox"
            checked={value.header}
            on:change={(e) => handleChange({ header: e.target.checked })}
          />
          Header Row
        </label>

        <label class="checkbox">
          <input
            type="checkbox"
            checked={value.striped}
            on:change={(e) => handleChange({ striped: e.target.checked })}
          />
          Striped Rows
        </label>

        <label class="checkbox">
          <input
            type="checkbox"
            checked={value.bordered}
            on:change={(e) => handleChange({ bordered: e.target.checked })}
          />
          Bordered
        </label>
      </div>

      <div class="actions">
        <Button variant="secondary" size="sm" on:click={addRow}>
          Add Row
        </Button>
        <Button variant="secondary" size="sm" on:click={addColumn}>
          Add Column
        </Button>
      </div>
    </div>
  {/if}

  <div 
    class="table-wrapper"
    class:table-wrapper--bordered={value.bordered}
  >
    <table
      class="table"
      class:table--striped={value.striped}
    >
      <tbody>
        {#each value.rows as row, rowIndex}
          <tr>
            {#each row as cell, colIndex}
              <td>
                {#if !readOnly}
                  <div class="cell">
                    <input
                      type="text"
                      value={cell}
                      on:input={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    />
                    
                    {#if rowIndex === 0 && value.rows.length > 1}
                      <button
                        class="remove-button"
                        on:click={() => removeColumn(colIndex)}
                        title="Remove column"
                      >
                        ×
                      </button>
                    {/if}
                    
                    {#if colIndex === 0 && value.rows[0].length > 1}
                      <button
                        class="remove-button remove-button--row"
                        on:click={() => removeRow(rowIndex)}
                        title="Remove row"
                      >
                        ×
                      </button>
                    {/if}
                  </div>
                {:else}
                  {cell}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-block {
    width: 100%;
    overflow-x: auto;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .options {
    display: flex;
    gap: var(--space-4);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }

  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .table-wrapper--bordered {
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table--striped tr:nth-child(even) {
    background-color: var(--bg-secondary);
  }

  td {
    padding: 0;
  }

  .cell {
    position: relative;
    padding: var(--space-2);
  }

  input {
    width: 100%;
    padding: var(--space-2);
    border: 1px solid transparent;
    background: none;
    font-size: inherit;
  }

  input:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--bg-primary);
  }

  .remove-button {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--error);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--transition);
  }

  .remove-button--row {
    top: 50%;
    right: auto;
    left: -8px;
    transform: translateY(-50%);
  }

  tr:hover .remove-button,
  td:hover .remove-button {
    opacity: 1;
  }
</style>