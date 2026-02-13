"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "@heroui/react";
import { AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: "danger" | "warning" | "success" | "info";
    confirmText?: string;
    cancelText?: string;
    isConfirm?: boolean;
    loading?: boolean;
    className?: string;
    variant?: "default" | "club";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = "info",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isConfirm = true,
    loading = false,
    className = "",
    variant = "default",
}: ConfirmModalProps) {
    const isClub = variant === "club";

    const getIcon = () => {
        const iconSize = isClub ? "w-6 h-6" : "w-6 h-6";
        switch (type) {
            case "danger":
                return <AlertCircle className={`${iconSize} text-red-500`} />;
            case "warning":
                return <AlertTriangle className={`${iconSize} text-amber-500`} />;
            case "success":
                return <CheckCircle2 className={`${iconSize} text-green-500`} />;
            default:
                return <Info className={`${iconSize} text-blue-500`} />;
        }
    };

    const getButtonStyles = () => {
        if (isClub) {
            return {
                confirm: "bg-[#00b2de] text-white font-bold rounded-2xl h-12 px-6",
                cancel: "bg-white/5 text-white/70 font-bold rounded-2xl h-12 px-6 hover:bg-white/10",
            };
        }
        return {
            confirm: "",
            cancel: "",
        };
    };

    const getButtonColor = () => {
        if (isClub) return undefined;
        switch (type) {
            case "danger":
                return "danger";
            case "warning":
                return "warning";
            case "success":
                return "success";
            default:
                return "primary";
        }
    };

    const buttonStyles = getButtonStyles();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            backdrop={isClub ? "blur" : "opaque"}
            className={className}
            classNames={{
                backdrop: isClub ? "bg-black/80 backdrop-blur-sm" : "bg-[#0b0b0b]/80 backdrop-opacity-100",
                wrapper: "z-[100]",
            }}
        >
            <ModalContent className={`
                ${isClub
                    ? "bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    : "bg-white dark:bg-[#121212] text-black dark:text-white border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden"}
            `}>
                {(onClose) => (
                    <>
                        <ModalHeader className={`flex gap-4 items-center p-8 pb-4 ${isClub ? "border-none" : "border-b border-gray-100 dark:border-white/5"}`}>
                            {isClub ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#00b2de]/10 rounded-2xl flex items-center justify-center">
                                        {/* Override icon color for club variant to match theme */}
                                        <div className="text-[#00b2de]">
                                            {getIcon()}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
                                        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mt-1">
                                            Confirmación requerida
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {getIcon()}
                                    <span className="font-bold">{title}</span>
                                </>
                            )}
                        </ModalHeader>
                        <ModalBody className={`py-6 px-8 ${isClub ? "pt-0" : ""}`}>
                            <p className={isClub ? "text-white/70 text-sm leading-relaxed" : "text-gray-600 dark:text-gray-400"}>
                                {message}
                            </p>
                        </ModalBody>
                        <ModalFooter className={`p-8 pt-4 gap-3 ${isClub ? "border-t border-white/5" : "border-t border-gray-100 dark:border-white/5"}`}>
                            {isConfirm && (
                                <Button
                                    variant={isClub ? "light" : "flat"}
                                    onPress={onClose}
                                    disabled={loading}
                                    className={`font-medium ${buttonStyles.cancel}`}
                                >
                                    {cancelText}
                                </Button>
                            )}
                            <Button
                                color={getButtonColor()}
                                onPress={onConfirm}
                                isLoading={loading}
                                className={`font-medium ${buttonStyles.confirm}`}
                            >
                                {confirmText}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
