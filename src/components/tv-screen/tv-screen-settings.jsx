import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { GripVertical, RotateCcw, Save, Monitor } from 'lucide-react';
import api from '../../api/api';
import { getSavedCategoryOrder, saveCategoryOrder, clearCategoryOrder, applyCategoryOrder } from '../../utils/tvScreenSettings';

/**
 * TV Screen Settings component for configuring category display order
 */
export function TVScreenSettings() {
  const [categories, setCategories] = useState([]);
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const { toast } = useToast();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data: categoriesData } = await api.categories.getCategories({
          type: 'drinks',
        });
        
        setCategories(categoriesData);
        
        // Apply saved order
        const savedOrder = getSavedCategoryOrder();
        const ordered = applyCategoryOrder(categoriesData, savedOrder);
        setOrderedCategories(ordered);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load categories.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  // Handle drag start
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add some visual feedback
    e.target.style.opacity = '0.5';
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Handle drop
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      return;
    }

    const newOrderedCategories = [...orderedCategories];
    const draggedCategory = newOrderedCategories[draggedItem];

    // Remove the dragged item
    newOrderedCategories.splice(draggedItem, 1);

    // Insert at new position
    const insertIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newOrderedCategories.splice(insertIndex, 0, draggedCategory);

    setOrderedCategories(newOrderedCategories);
    setDragOverIndex(null);
  };

  // Handle save order
  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      const categoryIds = orderedCategories.map(cat => cat._id);
      saveCategoryOrder(categoryIds);
      
      toast({
        title: 'Success',
        description: 'Category order saved successfully!',
      });
    } catch (error) {
      console.error('Error saving category order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save category order.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle reset to default order
  const handleResetOrder = () => {
    clearCategoryOrder();
    setOrderedCategories([...categories]);
    toast({
      title: 'Reset Complete',
      description: 'Category order reset to default.',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            TV Screen Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading categories...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          TV Screen Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag and drop categories to reorder how they appear on the TV screen
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Category Display Order</h4>
          <div className="space-y-1">
            {orderedCategories.map((category, index) => (
              <div
                key={category._id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  flex items-center gap-3 p-3 bg-background border rounded-md cursor-move
                  transition-all duration-200 hover:bg-accent/50
                  ${dragOverIndex === index ? 'border-primary bg-primary/10' : 'border-border'}
                  ${draggedItem === index ? 'opacity-50' : ''}
                `}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Position: {index + 1}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                  {category._id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            onClick={handleSaveOrder}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
          <Button
            variant="outline"
            onClick={handleResetOrder}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <strong>Instructions:</strong> Drag the grip handle (⋮⋮) to reorder categories. 
          The order you set here will be reflected on the TV screen display. 
          Changes are saved locally in your browser.
        </div>
      </CardContent>
    </Card>
  );
}