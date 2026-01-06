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
}: ConfirmModalProps) {
    const getIcon = () => {
        switch (type) {
            case "danger":
                return <AlertCircle className="w-6 h-6 text-red-600" />;
            case "warning":
                return <AlertTriangle className="w-6 h-6 text-amber-600" />;
            case "success":
                return <CheckCircle2 className="w-6 h-6 text-green-600" />;
            default:
                return <Info className="w-6 h-6 text-blue-600" />;
        }
    };

    const getButtonColor = () => {
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            backdrop="blur"
            className="admin-scope"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex gap-3 items-center">
                            {getIcon()}
                            <span className="text-gray-900">{title}</span>
                        </ModalHeader>
                        <ModalBody>
                            <p className="text-gray-600">
                                {message}
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            {isConfirm && (
                                <Button
                                    variant="light"
                                    onPress={onClose}
                                    disabled={loading}
                                    className="font-medium text-gray-600 hover:text-gray-900"
                                >
                                    {cancelText}
                                </Button>
                            )}
                            <Button
                                color={getButtonColor()}
                                onPress={onConfirm}
                                isLoading={loading}
                                className="font-medium"
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
