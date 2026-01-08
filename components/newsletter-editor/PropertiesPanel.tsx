import React, { useState, useEffect, useRef } from 'react';
import { EditorBlock, ImageBlockContent, ButtonBlockContent, DividerBlockContent } from './types';
import { Input, Button, Slider } from '@heroui/react';
import { Trash2, Link, Type, Palette, Smartphone, Maximize, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Code2, Bold, User } from 'lucide-react';
import { uploadFile } from '@/services/files';

interface PropertiesProps {
    selectedBlock: EditorBlock | null;
    onUpdateBlock: (id: string, updates: Partial<EditorBlock>) => void;
    onDeleteBlock: (id: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesProps> = ({
    selectedBlock,
    onUpdateBlock,
    onDeleteBlock
}) => {
    const [uploading, setUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Reset ref when block changes
        if (selectedBlock?.id) {
            // Focus textarea if it's a text block
        }
    }, [selectedBlock?.id]);

    if (!selectedBlock) {
        return (
            <div className="w-full bg-white flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="p-6 bg-slate-50 rounded-[2rem] mb-6 border border-slate-100 shadow-inner">
                    <Smartphone className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-[13px] font-bold text-slate-800 mb-1">Nada seleccionado</p>
                <p className="text-[11px] font-medium text-slate-400 max-w-[150px]">
                    Selecciona un bloque en el lienzo para editar sus propiedades
                </p>
            </div>
        );
    }

    const updateContent = (updates: any) => {
        onUpdateBlock(selectedBlock.id, {
            content: { ...selectedBlock.content, ...updates }
        });
    };

    const insertAtCursor = (textToInsert: string) => {
        if (!textareaRef.current) return;
        const { selectionStart, selectionEnd } = textareaRef.current;
        const currentValue = selectedBlock.content.text || '';
        const newValue =
            currentValue.substring(0, selectionStart) +
            textToInsert +
            currentValue.substring(selectionEnd);

        updateContent({ text: newValue });

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newPos = selectionStart + textToInsert.length;
                textareaRef.current.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

    const wrapSelection = (prefix: string, suffix: string) => {
        if (!textareaRef.current) return;
        const { selectionStart, selectionEnd } = textareaRef.current;
        const currentValue = selectedBlock.content.text || '';
        const selectedText = currentValue.substring(selectionStart, selectionEnd);
        const newValue =
            currentValue.substring(0, selectionStart) +
            prefix + selectedText + suffix +
            currentValue.substring(selectionEnd);

        updateContent({ text: newValue });

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newStart = selectionStart + prefix.length;
                const newEnd = selectionEnd + prefix.length;
                textareaRef.current.setSelectionRange(newStart, newEnd);
            }
        }, 0);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const { url } = await uploadFile(file, { folder: 'newsletter', isPublic: true });
            updateContent({ url });
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full bg-white flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 capitalize leading-tight">
                            {selectedBlock.type}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Ajustes del bloque</p>
                    </div>
                </div>
                <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="flat"
                    onClick={() => onDeleteBlock(selectedBlock.id)}
                    className="rounded-xl w-8 h-8"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="p-6 space-y-8">
                {selectedBlock.type === 'text' && (
                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Type className="w-3 h-3 text-primary" /> Contenido de Texto
                                </label>
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        className="h-7 px-2 min-w-0 font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        onClick={() => wrapSelection('<b>', '</b>')}
                                    >
                                        <Bold className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        className="h-7 px-2 min-w-0 font-bold bg-primary/10 text-primary hover:bg-primary/20"
                                        onClick={() => insertAtCursor('{{nombre}}')}
                                        startContent={<User className="w-3 h-3" />}
                                    >
                                        Nombre
                                    </Button>
                                </div>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={selectedBlock.content.text}
                                onChange={(e) => updateContent({ text: e.target.value })}
                                className="w-full p-4 border border-slate-200 rounded-2xl text-[13px] font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[140px] transition-all bg-slate-50/50 hover:bg-white leading-relaxed text-slate-700 outline-none resize-none"
                                placeholder="Escribe aquí tu mensaje..."
                            />
                        </div>

                        {/* Typography Controls */}
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tamaño de Fuente</label>
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{selectedBlock.content.fontSize || 15}px</span>
                                </div>
                                <Slider
                                    size="sm"
                                    step={1}
                                    maxValue={48}
                                    minValue={12}
                                    value={selectedBlock.content.fontSize || 15}
                                    onChange={(val) => updateContent({ fontSize: val as number })}
                                    color="primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <label className="text-[10px) font-bold text-slate-400 uppercase tracking-widest">Color Texto</label>
                                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                                        <input
                                            type="color"
                                            value={selectedBlock.content.textColor || '#334155'}
                                            onChange={(e) => updateContent({ textColor: e.target.value })}
                                            className="w-full h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fondo</label>
                                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                                        <input
                                            type="color"
                                            value={selectedBlock.content.backgroundColor || '#ffffff'}
                                            onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                                            className="w-full h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alineación</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['left', 'center', 'right', 'justify'].map((align) => (
                                        <button
                                            key={align}
                                            onClick={() => updateContent({ textAlign: align })}
                                            className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${(selectedBlock.content.textAlign || 'left') === align
                                                ? 'bg-white shadow-sm text-primary'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                            {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                            {align === 'right' && <AlignRight className="w-4 h-4" />}
                                            {align === 'justify' && <AlignJustify className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedBlock.type === 'image' && (
                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multimedia</label>
                            {selectedBlock.content.url ? (
                                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 shadow-sm">
                                    <img
                                        src={selectedBlock.content.url}
                                        className="w-full h-full object-cover"
                                        alt="Preview"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <Button
                                            size="sm"
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                            className="bg-white text-slate-900 font-bold px-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Reemplazar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group bg-slate-50/50"
                                >
                                    {uploading ? (
                                        <div className="space-y-3">
                                            <div className="animate-spin w-6 h-6 border-[3px] border-primary border-t-transparent rounded-full mx-auto" />
                                            <p className="text-[10px] font-bold text-primary uppercase">Subiendo...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="w-6 h-6 text-slate-300 group-hover:text-primary" />
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subir imagen</p>
                                        </>
                                    )}
                                </div>
                            )}
                            <input
                                id="image-upload"
                                type="file"
                                className="hidden"
                                onChange={handleImageUpload}
                                accept="image/*"
                            />
                        </div>

                        <Input
                            label="Enlace al hacer clic"
                            labelPlacement="outside"
                            placeholder="https://tu-sitio.com/promo"
                            value={selectedBlock.content.link || ''}
                            onValueChange={(val) => updateContent({ link: val })}
                            variant="bordered"
                            radius="lg"
                            classNames={{
                                label: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5",
                                input: "text-sm font-medium",
                                inputWrapper: "border-slate-200 hover:border-slate-300 focus-within:!border-primary"
                            }}
                        />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ancho</label>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{selectedBlock.content.width || 100}%</span>
                            </div>
                            <Slider
                                size="sm"
                                step={10}
                                maxValue={100}
                                minValue={10}
                                value={selectedBlock.content.width || 100}
                                onChange={(val) => updateContent({ width: val as number })}
                                color="primary"
                            />
                        </div>
                    </div>
                )}

                {selectedBlock.type === 'button' && (
                    <div className="space-y-6">
                        <Input
                            label="Texto del botón"
                            labelPlacement="outside"
                            placeholder="Ej: ¡Únete ahora!"
                            value={selectedBlock.content.text}
                            onValueChange={(val) => updateContent({ text: val })}
                            variant="bordered"
                            radius="lg"
                            classNames={{
                                label: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5",
                                input: "text-sm font-bold",
                                inputWrapper: "border-slate-200 hover:border-slate-300 focus-within:!border-primary"
                            }}
                        />

                        <Input
                            label="Enlace (URL)"
                            labelPlacement="outside"
                            placeholder="https://..."
                            value={selectedBlock.content.url}
                            onValueChange={(val) => updateContent({ url: val })}
                            variant="bordered"
                            radius="lg"
                            classNames={{
                                label: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5",
                                input: "text-sm font-medium",
                                inputWrapper: "border-slate-200 hover:border-slate-300 focus-within:!border-primary"
                            }}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fondo</label>
                                <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                                    <input
                                        type="color"
                                        value={selectedBlock.content.backgroundColor}
                                        onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shrink-0"
                                    />
                                    <span className="text-[11px] font-bold text-slate-600 uppercase">{selectedBlock.content.backgroundColor}</span>
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Texto</label>
                                <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                                    <input
                                        type="color"
                                        value={selectedBlock.content.color}
                                        onChange={(e) => updateContent({ color: e.target.value })}
                                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shrink-0"
                                    />
                                    <span className="text-[11px] font-bold text-slate-600 uppercase">{selectedBlock.content.color}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Redondeado</label>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{selectedBlock.content.borderRadius || 8}px</span>
                            </div>
                            <Slider
                                size="sm"
                                step={1}
                                maxValue={30}
                                minValue={0}
                                value={selectedBlock.content.borderRadius || 8}
                                onChange={(val) => updateContent({ borderRadius: val as number })}
                                color="primary"
                            />
                        </div>
                    </div>
                )}

                {selectedBlock.type === 'divider' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Espaciado</label>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{selectedBlock.content.padding || 20}px</span>
                            </div>
                            <Slider
                                size="sm"
                                step={5}
                                maxValue={100}
                                minValue={0}
                                value={selectedBlock.content.padding || 20}
                                onChange={(val) => updateContent({ padding: val as number })}
                                color="primary"
                            />
                        </div>
                    </div>
                )}

                {selectedBlock.type === 'spacer' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Altura</label>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{selectedBlock.content.height || 50}px</span>
                            </div>
                            <Slider
                                size="sm"
                                step={10}
                                maxValue={200}
                                minValue={10}
                                value={selectedBlock.content.height || 50}
                                onChange={(val) => updateContent({ height: val as number })}
                                color="primary"
                            />
                        </div>
                    </div>
                )}

                {selectedBlock.type === 'html' && (
                    <div className="space-y-4">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Code2 className="w-3 h-3 text-primary" /> Código HTML
                            </label>
                            <textarea
                                value={selectedBlock.content.html}
                                onChange={(e) => updateContent({ html: e.target.value })}
                                className="w-full p-4 border border-slate-200 rounded-2xl text-[12px] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[300px] transition-all bg-slate-900 text-slate-50 outline-none leading-relaxed resize-none scrollbar-thin scrollbar-thumb-slate-700"
                                placeholder="<div>HTML personalizado...</div>"
                            />
                        </div>
                        <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100/50">
                            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                <span className="font-bold">Precaución:</span> El código HTML se renderizará tal cual. Asegúrate de que sea válido y responsive.
                            </p>
                        </div>
                    </div>
                )}

                {selectedBlock.type === 'social' && (
                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estilo de Ícono</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['circle', 'rounded', 'square'].map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => updateContent({ iconStyle: style })}
                                        className={`flex-1 h-8 rounded-lg text-[10px] font-bold uppercase transition-all ${(selectedBlock.content.iconStyle || 'circle') === style
                                            ? 'bg-white shadow-sm text-primary'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {style === 'circle' && 'Círculo'}
                                        {style === 'rounded' && 'Borde'}
                                        {style === 'square' && 'Cuadrado'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 block">Redes Sociales</label>
                            {['facebook', 'instagram', 'twitter', 'linkedin', 'website'].map((network) => {
                                const current = (selectedBlock.content.networks || []).find((n: any) => n.network === network);
                                const isEnabled = !!current;

                                return (
                                    <div key={network} className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isEnabled}
                                                onChange={(e) => {
                                                    const networks = selectedBlock.content.networks || [];
                                                    if (e.target.checked) {
                                                        updateContent({ networks: [...networks, { network, url: '' }] });
                                                    } else {
                                                        updateContent({ networks: networks.filter((n: any) => n.network !== network) });
                                                    }
                                                }}
                                                className="rounded border-slate-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-slate-700 capitalize flex-1">{network}</span>
                                        </div>
                                        {isEnabled && (
                                            <Input
                                                size="sm"
                                                placeholder={`URL de ${network}`}
                                                value={current.url}
                                                onValueChange={(val) => {
                                                    const networks = (selectedBlock.content.networks || []).map((n: any) =>
                                                        n.network === network ? { ...n, url: val } : n
                                                    );
                                                    updateContent({ networks });
                                                }}
                                                variant="bordered"
                                                radius="lg"
                                                classNames={{
                                                    input: "text-xs",
                                                    inputWrapper: "h-9 min-h-0 border-slate-200"
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
