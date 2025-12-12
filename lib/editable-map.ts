import editableMapJson from '../docs/editable-map.json' assert { type: 'json' };

export interface EditableMapEntry {
  elementId: string;
  tab: string;
  page?: string;
  inputName?: string;
  component?: string;
}

export const editableMap = editableMapJson as EditableMapEntry[];

export const editableNavigationMap: Record<string, { tab: string; page?: string; inputName?: string }> =
  editableMap.reduce((acc, entry) => {
    acc[entry.elementId] = {
      tab: entry.tab as string,
      page: entry.page,
      inputName: entry.inputName
    };
    return acc;
  }, {} as Record<string, { tab: string; page?: string; inputName?: string }>);
