import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { NewsletterDesign, EditorBlock, BlockType } from './types';
import { EditorSidebar } from './EditorSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { generateNewsletterHtml } from './utils/generateHtml';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Trash2, ChevronUp, ChevronDown, Eye, Code, Smartphone, Monitor, Image as ImageIcon, Facebook, Instagram, Twitter, Linkedin, Globe, MoveVertical } from 'lucide-react';
import { Button, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';

export interface NewsletterEditorRef {
    getDesign: () => NewsletterDesign;
    getHtml: () => string;
    loadDesign: (design: NewsletterDesign) => void;
}

interface NewsletterEditorProps {
    initialDesign?: NewsletterDesign;
}

const NewsletterEditor = forwardRef<NewsletterEditorRef, NewsletterEditorProps>(({ initialDesign }, ref) => {
    const defaultDesign: NewsletterDesign = {
        blocks: [],
        globalStyles: {
            backgroundColor: '#f8fafc',
            fontFamily: "'Inter', sans-serif"
        }
    };

    const [design, setDesign] = useState<NewsletterDesign>(() => {
        if (!initialDesign) return defaultDesign;
        const normalizedDesign = typeof initialDesign === 'object' ? initialDesign : {};
        return {
            ...defaultDesign,
            ...normalizedDesign,
            blocks: (normalizedDesign as any).blocks || []
        };
    });
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

    useImperativeHandle(ref, () => ({
        getDesign: () => design,
        getHtml: () => generateNewsletterHtml(design),
        loadDesign: (newDesign: NewsletterDesign) => {
            const normalized = typeof newDesign === 'object' ? newDesign : {};
            setDesign({
                ...defaultDesign,
                ...normalized,
                blocks: (normalized as any).blocks || []
            });
        },
    }));

    const addBlock = (type: BlockType) => {
        const id = Math.random().toString(36).substr(2, 9);
        let content = {};

        switch (type) {
            case 'text':
                content = { text: 'Haz clic aquí para editar este texto...' };
                break;
            case 'image':
                content = { url: '', alt: '', width: 100 };
                break;
            case 'button':
                content = { text: '¡ÚNETE AHORA!', url: '', backgroundColor: '#00b2de', color: '#ffffff', borderRadius: 8 };
                break;
            case 'divider':
                content = { padding: 20 };
                break;
            case 'spacer':
                content = { height: 50 };
                break;
            case 'social':
                content = {
                    networks: [
                        { network: 'facebook', url: '' },
                        { network: 'instagram', url: '' }
                    ],
                    iconStyle: 'circle',
                    align: 'center'
                };
                break;
            case 'html':
                content = { html: '<div style="padding: 20px; background: #f0f0f0; text-align: center;">HTML Personalizado</div>' };
                break;
        }

        const newBlock: EditorBlock = { id, type, content };
        setDesign(prev => ({
            ...prev,
            blocks: [...(prev?.blocks || []), newBlock]
        }));
        setSelectedBlockId(id);
    };

    const updateBlock = (id: string, updates: Partial<EditorBlock>) => {
        setDesign(prev => ({
            ...prev,
            blocks: (prev?.blocks || []).map(b => b.id === id ? { ...b, ...updates } : b)
        }));
    };

    const deleteBlock = (id: string) => {
        setDesign(prev => ({
            ...prev,
            blocks: (prev?.blocks || []).filter(b => b.id !== id)
        }));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const blocks = design?.blocks || [];
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setDesign(prev => ({ ...prev, blocks: newBlocks }));
    };

    const handleReorder = (newBlocks: EditorBlock[]) => {
        setDesign(prev => ({ ...prev, blocks: newBlocks }));
    };

    const renderCanvasBlock = (block: EditorBlock) => {
        const isSelected = selectedBlockId === block.id;

        return (
            <div
                key={block.id}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBlockId(block.id);
                }}
                className={`relative group cursor-pointer border-2 transition-all duration-300 rounded-xl mb-3 overflow-hidden ${isSelected
                    ? 'border-primary ring-4 ring-primary/10 shadow-2xl z-20 scale-[1.01]'
                    : 'border-transparent hover:border-slate-200 bg-white'
                    }`}
            >
                {/* Editor Controls Overlay - Positioned inside for better UX with drag and drop */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-2 top-2 z-30 flex gap-1.5 p-1 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-100"
                        >
                            <Tooltip content="Eliminar" placement="top" color="danger">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteBlock(block.id);
                                    }}
                                    className="w-7 h-7 min-w-0 rounded-md"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </Tooltip>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative group-hover:bg-slate-50/30 transition-colors">
                    {block.type === 'text' && (
                        <div
                            className="p-8"
                            style={{
                                backgroundColor: block.content.backgroundColor,
                                textAlign: block.content.textAlign
                            }}
                        >
                            <div
                                className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-normal"
                                style={{
                                    fontSize: block.content.fontSize ? `${block.content.fontSize}px` : '15px',
                                    color: block.content.textColor
                                }}
                                dangerouslySetInnerHTML={{ __html: block.content.text.replace(/\n/g, '<br/>') }}
                            />
                        </div>
                    )}
                    {block.type === 'image' && (
                        <div className="flex justify-center bg-slate-50/30">
                            {block.content.url ? (
                                <img
                                    src={block.content.url}
                                    alt={block.content.alt}
                                    style={{ width: `${block.content.width}%` }}
                                    className="block transition-transform duration-500 hover:scale-[1.02]"
                                />
                            ) : (
                                <div className="p-20 text-center w-full border-b border-slate-100">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <ImageIcon className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sin imagen configurada</p>
                                </div>
                            )}
                        </div>
                    )}
                    {block.type === 'button' && (
                        <div className="flex justify-center py-10 px-8">
                            <span
                                style={{
                                    backgroundColor: block.content.backgroundColor,
                                    color: block.content.color,
                                    borderRadius: `${block.content.borderRadius}px`,
                                    padding: '14px 40px',
                                    fontWeight: '800',
                                    fontSize: '15px',
                                    display: 'inline-block',
                                    textAlign: 'center',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                    letterSpacing: '0.01em'
                                }}
                            >
                                {block.content.text}
                            </span>
                        </div>
                    )}
                    {block.type === 'divider' && (
                        <div style={{ padding: `${block.content.padding}px 0` }} className="px-8">
                            <div className="h-px bg-slate-200 w-full" />
                        </div>
                    )}
                    {block.type === 'spacer' && (
                        <div style={{ height: `${block.content.height || 50}px` }} className="w-full relative group/spacer">
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-dashed border-slate-200 border hidden group-hover/spacer:block" />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-400 hidden group-hover/spacer:block font-mono">
                                {block.content.height || 50}px
                            </div>
                        </div>
                    )}
                    {block.type === 'html' && (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg m-4">
                            <div className="flex items-center gap-2 mb-2 text-[10px] bg-slate-200/50 w-fit px-2 py-1 rounded text-slate-500 font-bold uppercase tracking-wider">
                                <Code className="w-3 h-3" /> Bloque HTML
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: block.content.html }} />
                        </div>
                    )}
                    {block.type === 'social' && (
                        <div className="py-6 px-8 flex justify-center gap-3">
                            {(block.content.networks || []).map((net: any, i: number) => {
                                const icons: any = {
                                    facebook: Facebook,
                                    instagram: Instagram,
                                    twitter: Twitter,
                                    linkedin: Linkedin,
                                    website: Globe
                                };
                                const Icon = icons[net.network] || Globe;
                                const isCircle = (block.content.iconStyle || 'circle') === 'circle';
                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-center w-10 h-10 transition-colors
                                            ${block.content.iconStyle === 'circle' ? 'rounded-full' : block.content.iconStyle === 'rounded' ? 'rounded-lg' : 'rounded-none'}
                                            bg-slate-100 text-slate-600
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full w-full bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar with fixed width */}
            <div className="w-[260px] border-r border-slate-200 bg-white shrink-0 shadow-sm z-10">
                <EditorSidebar onAddBlock={addBlock} />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100/30">
                {/* Editor Toolbar */}
                <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 px-3 py-1 rounded-full">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Lienzo de Diseño</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Eye className="w-3.5 h-3.5" />}
                            onClick={onPreviewOpen}
                            className="font-semibold"
                        >
                            Vista Previa
                        </Button>
                    </div>
                </div>

                {/* Canvas Area with centering logic */}
                <div
                    className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-thin scrollbar-thumb-slate-200"
                    onClick={() => setSelectedBlockId(null)}
                >
                    <div className="max-w-[600px] mx-auto transition-all duration-500 ease-in-out">
                        {(design?.blocks?.length || 0) === 0 ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-[32px] p-20 text-center bg-white/50 backdrop-blur-sm">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-8 border border-slate-100">
                                    <Monitor className="w-10 h-10 text-slate-300" />
                                </div>
                                <h4 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Tu lienzo está vacío</h4>
                                <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed mb-8">
                                    Arrastra o pulsa en los bloques laterales para construir tu newsletter profesional.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden border border-slate-200 ring-1 ring-slate-900/5">
                                {/* Email Header Mockup */}


                                <div className="p-4 min-h-[500px]">
                                    <Reorder.Group
                                        axis="y"
                                        values={design?.blocks || []}
                                        onReorder={handleReorder}
                                        className="space-y-3"
                                    >
                                        {(design?.blocks || []).map((block) => (
                                            <Reorder.Item key={block.id} value={block} className="relative">
                                                {renderCanvasBlock(block)}
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Properties Panel with fixed width */}
            <div className="w-[320px] border-l border-slate-200 bg-white shrink-0 shadow-sm z-10">
                <PropertiesPanel
                    selectedBlock={(design?.blocks || []).find(b => b.id === selectedBlockId) || null}
                    onUpdateBlock={updateBlock}
                    onDeleteBlock={deleteBlock}
                />
            </div>

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="5xl" scrollBehavior="inside" backdrop="blur">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 py-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="font-bold text-gray-900">Vista Previa de Newsletter</span>
                            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                                <Button
                                    size="sm"
                                    variant={previewMode === 'desktop' ? 'solid' : 'light'}
                                    color={previewMode === 'desktop' ? 'primary' : 'default'}
                                    onClick={() => setPreviewMode('desktop')}
                                    isIconOnly
                                >
                                    <Monitor className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant={previewMode === 'mobile' ? 'solid' : 'light'}
                                    color={previewMode === 'mobile' ? 'primary' : 'default'}
                                    onClick={() => setPreviewMode('mobile')}
                                    isIconOnly
                                >
                                    <Smartphone className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </ModalHeader>
                    <ModalBody className="p-8 bg-gray-50 flex items-center justify-center min-h-[500px]">
                        <div className={`transition-all duration-300 bg-white shadow-2xl overflow-hidden rounded-2xl ${previewMode === 'mobile' ? 'w-[375px]' : 'w-full'
                            }`}>
                            <iframe
                                title="Preview"
                                srcDoc={generateNewsletterHtml(design)}
                                className="w-full h-full border-0 min-h-[600px]"
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter className="border-t border-gray-100">
                        <Button color="primary" onPress={onPreviewClose}>
                            Cerrar Vista Previa
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
});

NewsletterEditor.displayName = 'NewsletterEditor';

export default NewsletterEditor;
