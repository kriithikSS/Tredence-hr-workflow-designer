import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Edge } from '@xyflow/react';
import type { TWorkflowNode } from '../utils/templates';

export interface CustomTemplate {
  id: string;
  title: string;
  description: string;
  nodes: TWorkflowNode[];
  edges: Edge[];
  createdAt: string;
  isCustom: true;
}

interface CustomTemplatesState {
  templates: CustomTemplate[];
  saveTemplate: (title: string, description: string, nodes: TWorkflowNode[], edges: Edge[]) => void;
  deleteTemplate: (id: string) => void;
}

export const useCustomTemplates = create<CustomTemplatesState>()(
  persist(
    (set) => ({
      templates: [],
      saveTemplate: (title, description, nodes, edges) => {
        const t: CustomTemplate = {
          id: `custom-${Date.now()}`,
          title,
          description,
          nodes,
          edges,
          createdAt: new Date().toISOString(),
          isCustom: true,
        };
        set((s) => ({ templates: [...s.templates, t] }));
      },
      deleteTemplate: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
    }),
    { name: 'hr-custom-templates' },
  ),
);
