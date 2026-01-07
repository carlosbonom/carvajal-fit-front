"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { Product } from "@/services/products";

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
    isAddingToCart: boolean;
}

export function ProductModal({
    product,
    isOpen,
    onClose,
    onAddToCart,
    isAddingToCart,
}: ProductModalProps) {
    if (!product) return null;

    const price =
        product.prices.find((p) => p.currency === "CLP" && p.isActive) ||
        product.prices[0];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#0a0e12] w-full max-w-lg rounded-2xl border border-gray-800 overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
                            {/* Close button */}
                            <button
                                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors text-white"
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto custom-scrollbar">
                                {/* Image */}
                                <div className="relative aspect-video w-full bg-[#111]">
                                    {product.thumbnailUrl ? (
                                        <img
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            src={product.thumbnailUrl}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            Sin imagen
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 md:p-8 space-y-6">
                                    {/* Header */}
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            {product.name}
                                        </h2>
                                        {price && (
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-3xl font-bold text-[#00b2de]">
                                                    ${price.amount.toLocaleString("es-CL")}
                                                </p>
                                                <span className="text-sm text-gray-400">
                                                    {price.currency}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4">
                                        <button
                                            className="flex-1 py-3 px-6 bg-[#00b2de] hover:bg-[#00b2de]/90 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isAddingToCart}
                                            onClick={() => onAddToCart(product)}
                                        >
                                            {isAddingToCart ? "Procesando..." : "Comprar ahora"}
                                        </button>
                                    </div>

                                    {/* Description */}
                                    {product.description && (
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-gray-300 leading-relaxed text-sm">
                                                {product.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Features/Includes (Mock data if actual data not available in struct) */}
                                    <div className="space-y-3">
                                        <h3 className="text-white font-bold text-lg">
                                            ¿Qué incluye?
                                        </h3>
                                        <ul className="space-y-2">
                                            {/* Assuming product might have 'features' or similar later. For now generic or descriptions lines */}
                                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                                <Check className="w-5 h-5 text-[#00b2de] shrink-0" />
                                                <span>Acceso inmediato al contenido digital</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                                <Check className="w-5 h-5 text-[#00b2de] shrink-0" />
                                                <span>Soporte para dudas y consultas</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                                <Check className="w-5 h-5 text-[#00b2de] shrink-0" />
                                                <span>Garantía de satisfacción</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
