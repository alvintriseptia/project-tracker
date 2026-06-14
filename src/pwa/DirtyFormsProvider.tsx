import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type DirtyFormsValue = {
  hasDirtyForms: boolean;
  setFormDirty: (id: string, dirty: boolean) => void;
};

const DirtyFormsContext = createContext<DirtyFormsValue | null>(null);

export function DirtyFormsProvider({ children }: { children: React.ReactNode }) {
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const setFormDirty = useCallback((id: string, dirty: boolean) => {
    setDirtyIds((current) => {
      if (current.has(id) === dirty) {
        return current;
      }
      const next = new Set(current);
      if (dirty) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const value = useMemo(
    () => ({ hasDirtyForms: dirtyIds.size > 0, setFormDirty }),
    [dirtyIds, setFormDirty],
  );
  return (
    <DirtyFormsContext.Provider value={value}>
      {children}
    </DirtyFormsContext.Provider>
  );
}

export function useDirtyForms(): DirtyFormsValue {
  const value = useContext(DirtyFormsContext);
  if (!value) throw new Error("useDirtyForms requires DirtyFormsProvider.");
  return value;
}
