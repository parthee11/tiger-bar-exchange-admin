import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import branchesApi from '../api/branches';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../components/ui/use-toast';

/**
 * List with search, multi-select checkboxes, and reorderable selected list
 */
function ItemMultiSelect({ title, items, selectedIds, onChange }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((it) => it.name?.toLowerCase().includes(q));
  }, [items, query]);

  const selectedItems = useMemo(() => {
    const byId = new Map(items.map((i) => [i._id, i]));
    return selectedIds.map((id) => byId.get(id)).filter(Boolean);
  }, [items, selectedIds]);

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const move = (from, to) => {
    if (to < 0 || to >= selectedIds.length) return;
    const next = [...selectedIds];
    const [spliced] = next.splice(from, 1);
    next.splice(to, 0, spliced);
    onChange(next);
  };

  const removeAt = (index) => {
    const next = selectedIds.filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{title}</span>
          <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        <Input
          placeholder={`Search ${title.toLowerCase()} items...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex-1 overflow-auto divide-y rounded-md border">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No items</div>
          ) : (
            filtered.map((it) => (
              <label key={it._id} className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={selectedIds.includes(it._id)}
                  onCheckedChange={() => toggle(it._id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium text-sm">{it.name}</div>
                  {it.category?.name && (
                    <div className="text-xs text-muted-foreground truncate">{it.category.name}</div>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        {/* Selected order (reorderable) */}
        {selectedItems.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-medium mb-2">Selected order</div>
            <div className="rounded-md border divide-y max-h-48 overflow-auto">
              {selectedItems.map((it, idx) => (
                <div key={it._id} className="flex items-center gap-2 p-2 bg-background">
                  <div className="text-xs text-muted-foreground w-5 text-right">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm">{it.name}</div>
                    {it.category?.name && (
                      <div className="text-xs text-muted-foreground truncate">{it.category.name}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="h-7 px-2 rounded border text-xs disabled:opacity-50"
                      onClick={() => move(idx, idx - 1)}
                      disabled={idx === 0}
                      title="Move up"
                    >▲</button>
                    <button
                      className="h-7 px-2 rounded border text-xs disabled:opacity-50"
                      onClick={() => move(idx, idx + 1)}
                      disabled={idx === selectedItems.length - 1}
                      title="Move down"
                    >▼</button>
                    <button
                      className="h-7 px-2 rounded border text-xs"
                      onClick={() => removeAt(idx)}
                      title="Remove from selection"
                    >Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Highlights() {
  const { toast } = useToast();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);

  // Highlights state (arrays of item IDs)
  const [trending, setTrending] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);

  // Load branches and default selection
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const { data } = await branchesApi.getBranches();
        setBranches(data || []);
        const active = (data || []).find((b) => b.isActive) || (data || [])[0];
        if (active) setSelectedBranchId(active._id);
      } catch (e) {
        toast({ title: 'Failed to load branches', variant: 'destructive' });
      }
    };
    loadBranches();
  }, [toast]);

  // Load items and highlights when branch changes
  useEffect(() => {
    const loadData = async () => {
      if (!selectedBranchId) return;
      setLoading(true);
      try {
        // Load all drink items for branch
        const itemsResp = await api.items.getItems({ branch: selectedBranchId, type: 'drinks', noLimit: true });
        setItems(itemsResp.data || []);

        // Load current highlights
        const highlightsResp = await api.settings.getHighlights(selectedBranchId);
        const value = highlightsResp?.data || { trending: [], topGainers: [], topLosers: [] };
        setTrending(value.trending || []);
        setTopGainers(value.topGainers || []);
        setTopLosers(value.topLosers || []);
      } catch (e) {
        toast({ title: 'Failed to load highlights', description: e?.message || 'Please try again', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedBranchId, toast]);

  const save = async () => {
    if (!selectedBranchId) return;
    setSaving(true);
    try {
      await api.settings.updateHighlights(selectedBranchId, { trending, topGainers, topLosers });
      toast({ title: 'Highlights saved' });
    } catch (e) {
      toast({ title: 'Failed to save highlights', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Highlights</h1>
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={!selectedBranchId || saving || loading}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2 md:col-span-1">
          <label className="text-sm font-medium">Branch</label>
          <select
            className="border rounded-md h-10 px-3 text-sm bg-background"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="" disabled>
              Select a branch
            </option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[480px]">
        <ItemMultiSelect
          title="Trending"
          items={items}
          selectedIds={trending}
          onChange={setTrending}
        />
        <ItemMultiSelect
          title="Top Gainers"
          items={items}
          selectedIds={topGainers}
          onChange={setTopGainers}
        />
        <ItemMultiSelect
          title="Top Losers"
          items={items}
          selectedIds={topLosers}
          onChange={setTopLosers}
        />
      </div>

      {(loading || !selectedBranchId) && (
        <div className="text-sm text-muted-foreground">{!selectedBranchId ? 'Select a branch to manage highlights.' : 'Loading…'}</div>
      )}
    </div>
  );
}

export default Highlights;