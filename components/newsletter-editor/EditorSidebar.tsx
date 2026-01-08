import React from 'react';
import { Type, Image as ImageIcon, MousePointer2, Minus, MoveVertical, Share2, Code2 } from 'lucide-react';
import { BlockType } from './types';

interface SidebarProps {
    onAddBlock: (type: BlockType) => void;
}

const BLOCKS = [
    { type: 'text' as BlockType, label: 'Texto', icon: Type, description: 'Párrafo de texto' },
    { type: 'image' as BlockType, label: 'Imagen', icon: ImageIcon, description: 'Imagen o banner' },
    { type: 'button' as BlockType, label: 'Botón', icon: MousePointer2, description: 'Llamada a la acción' },
    { type: 'divider' as BlockType, label: 'Divisor', icon: Minus, description: 'Línea separadora' },
    { type: 'spacer' as BlockType, label: 'Espaciador', icon: MoveVertical, description: 'Espacio vertical' },
    { type: 'social' as BlockType, label: 'Redes Sociales', icon: Share2, description: 'Iconos sociales' },
    { type: 'html' as BlockType, label: 'Código HTML', icon: Code2, description: 'Código personalizado' },
];

export const EditorSidebar: React.FC<SidebarProps> = ({ onAddBlock }) => {
    return (
        <div className="w-full bg-white flex flex-col h-full overflow-y-auto">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1">Bloques</h3>
                <p className="text-[10px] text-slate-400 font-medium">Añade elementos a tu diseño</p>
            </div>

            <div className="p-4 grid grid-cols-1 gap-2.5">
                {BLOCKS.map((block) => {
                    const Icon = block.icon;
                    return (
                        <button
                            key={block.type}
                            onClick={() => onAddBlock(block.type)}
                            className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-primary/20 hover:shadow-sm transition-all text-left group"
                        >
                            <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-primary/10 transition-colors border border-slate-100">
                                <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-slate-800">{block.label}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{block.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-auto p-4 bg-slate-50/50 border-t border-slate-100">
                <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Editor Pro</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Usa los controles del lienzo para mover o eliminar bloques rápidamente.
                    </p>
                </div>
            </div>
        </div>
    );
};
