"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Edit2, Trash2, Reply, X, AlertCircle } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  type Comment as CommentType,
} from "@/services/comments";

interface CommentsProps {
  contentId: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "confirm" | "alert";
}

function Modal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", type = "confirm" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/70">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          {type === "confirm" && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              type === "confirm"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#00b2de] text-white hover:bg-[#00a0c8]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Comments({ contentId }: CommentsProps) {
  const user = useAppSelector((state) => state.user.user);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const COMMENTS_LIMIT = 5;
  const REPLIES_LIMIT = 3;
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "confirm" | "alert";
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    loadComments();
  }, [contentId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getComments(contentId);
      setComments(data);
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
      showAlert("Error", "No se pudieron cargar los comentarios. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string) => {
    setModal({
      isOpen: true,
      type: "alert",
      title,
      message,
      onConfirm: () => {},
      confirmText: "Entendido",
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = "Confirmar",
    cancelText = "Cancelar"
  ) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const handleSubmitComment = async () => {
    if (!newCommentText.trim() || !user) return;

    try {
      setSubmitting(true);
      const newComment = await createComment(contentId, {
        text: newCommentText.trim(),
      });
      setComments((prev) => [newComment, ...prev]);
      setNewCommentText("");
    } catch (error) {
      console.error("Error al crear comentario:", error);
      showAlert("Error", "Error al publicar el comentario. Por favor, intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return;

    try {
      setSubmitting(true);
      const newReply = await createComment(contentId, {
        text: replyText.trim(),
        parentId,
      });
      
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === parentId) {
            return { ...comment, replies: [...(comment.replies || []), newReply] };
          }
          return comment;
        })
      );
      setReplyText("");
      setReplyingToId(null);
    } catch (error) {
      console.error("Error al responder:", error);
      showAlert("Error", "Error al publicar la respuesta. Por favor, intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      setSubmitting(true);
      const updated = await updateComment(commentId, {
        text: editText.trim(),
      });
      
      const updateInList = (comments: CommentType[]): CommentType[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            return updated;
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateInList(comment.replies),
            };
          }
          return comment;
        });
      };
      
      setComments(updateInList(comments));
      setEditingCommentId(null);
      setEditText("");
    } catch (error) {
      console.error("Error al actualizar comentario:", error);
      showAlert("Error", "Error al actualizar el comentario. Por favor, intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    showConfirm(
      "Eliminar comentario",
      "¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.",
      async () => {
        try {
          setSubmitting(true);
          await deleteComment(commentId);
          
          const removeFromList = (comments: CommentType[]): CommentType[] => {
            return comments
              .filter((comment) => comment.id !== commentId)
              .map((comment) => ({
                ...comment,
                replies: removeFromList(comment.replies),
              }));
          };
          
          setComments(removeFromList(comments));
        } catch (error) {
          console.error("Error al eliminar comentario:", error);
          showAlert("Error", "Error al eliminar el comentario. Por favor, intenta nuevamente.");
        } finally {
          setSubmitting(false);
        }
      },
      "Eliminar",
      "Cancelar"
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
    
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white/70">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-lg font-bold">Comentarios</h3>
        </div>
        <p className="text-white/50 text-sm">Cargando comentarios...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-[#00b2de]" />
          <h3 className="text-xl font-bold text-white">
            Comentarios
          </h3>
          <span className="text-white/50 text-sm">({comments.length})</span>
        </div>

      {/* Formulario para nuevo comentario */}
      {user && (
        <div className="space-y-2">
          <div className="flex gap-2 md:gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#00b2de] flex items-center justify-center text-white font-semibold text-xs md:text-sm">
                {getInitials(user.name, user.email)}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Agrega un comentario..."
                className="w-full px-3 py-2 md:px-4 md:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30 resize-none transition-all text-sm"
                rows={2}
                disabled={submitting}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitComment}
                  disabled={!newCommentText.trim() || submitting}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {/* <span className="hidden sm:inline">Publicando...</span>
                      <span className="sm:hidden">...</span> */}
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>Comentar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Lista de comentarios */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-white/20 mb-3" />
              <p className="text-white/50 text-sm">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            </div>
          ) : (
            <>
              {(showAllComments ? comments : comments.slice(0, COMMENTS_LIMIT)).map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  user={user}
                  onReply={(parentId) => {
                    setReplyingToId(parentId);
                    setReplyText("");
                  }}
                  onEdit={(commentId, text) => {
                    setEditingCommentId(commentId);
                    setEditText(text);
                  }}
                  onDelete={handleDeleteComment}
                  onUpdate={handleUpdateComment}
                  onReplySubmit={handleReply}
                  replyingToId={replyingToId}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  editingCommentId={editingCommentId}
                  editText={editText}
                  setEditText={setEditText}
                  setEditingCommentId={setEditingCommentId}
                  setReplyingToId={setReplyingToId}
                  submitting={submitting}
                  formatDate={formatDate}
                  getInitials={getInitials}
                  repliesLimit={REPLIES_LIMIT}
                  expandedReplies={expandedReplies}
                  setExpandedReplies={setExpandedReplies}
                />
              ))}
              {comments.length > COMMENTS_LIMIT && !showAllComments && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAllComments(true)}
                    className="px-4 py-2 text-[#00b2de] hover:text-[#00a0c8] transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    Ver todos los comentarios ({comments.length})
                  </button>
                </div>
              )}
              {showAllComments && comments.length > COMMENTS_LIMIT && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAllComments(false)}
                    className="px-4 py-2 text-white/60 hover:text-white/80 transition-colors text-sm font-medium"
                  >
                    Mostrar menos
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </>
  );
}

interface CommentItemProps {
  comment: CommentType;
  user: any;
  onReply: (parentId: string) => void;
  onEdit: (commentId: string, text: string) => void;
  onDelete: (commentId: string) => Promise<void>;
  onUpdate: (commentId: string) => Promise<void>;
  onReplySubmit: (parentId: string) => Promise<void>;
  replyingToId: string | null;
  replyText: string;
  setReplyText: (text: string) => void;
  editingCommentId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  setEditingCommentId: (id: string | null) => void;
  setReplyingToId: (id: string | null) => void;
  submitting: boolean;
  formatDate: (date: string) => string;
  getInitials: (name: string | null, email: string) => string;
  repliesLimit: number;
  expandedReplies: Set<string>;
  setExpandedReplies: React.Dispatch<React.SetStateAction<Set<string>>>;
}

function CommentItem({
  comment,
  user,
  onReply,
  onEdit,
  onDelete,
  onUpdate,
  onReplySubmit,
  replyingToId,
  replyText,
  setReplyText,
  editingCommentId,
  editText,
  setEditText,
  setEditingCommentId,
  setReplyingToId,
  submitting,
  formatDate,
  getInitials,
  repliesLimit,
  expandedReplies,
  setExpandedReplies,
}: CommentItemProps) {
  const isOwner = user && user.id === comment.user.id;
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToId === comment.id;
  const showAllReplies = expandedReplies.has(comment.id);
  const repliesToShow = showAllReplies 
    ? comment.replies 
    : comment.replies.slice(0, repliesLimit);
  const hasMoreReplies = comment.replies.length > repliesLimit;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#00b2de] flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(comment.user.name, comment.user.email)}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header del comentario */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-white font-semibold text-sm">
                  {comment.user.name || comment.user.email.split("@")[0]}
                </p>
                <span className="text-white/40">•</span>
                <p className="text-white/60 text-xs">{formatDate(comment.createdAt)}</p>
              </div>
            </div>
            {isOwner && !isEditing && (
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(comment.id, comment.text)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Editar comentario"
                >
                  <Edit2 className="w-4 h-4 text-white/70" />
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Eliminar comentario"
                >
                  <Trash2 className="w-4 h-4 text-white/70" />
                </button>
              </div>
            )}
          </div>

          {/* Texto del comentario */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30 resize-none text-sm transition-all"
                rows={3}
                disabled={submitting}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate(comment.id)}
                  disabled={!editText.trim() || submitting}
                  className="px-4 py-2 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Guardar cambios
                </button>
                <button
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditText("");
                  }}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {comment.text}
            </p>
          )}

          {/* Acciones */}
          {!isEditing && user && (
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center gap-2 text-white/70 hover:text-[#00b2de] transition-colors text-sm font-medium"
              >
                <Reply className="w-4 h-4" />
                Responder
              </button>
            </div>
          )}

          {/* Formulario de respuesta */}
          {isReplying && user && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#00b2de] flex items-center justify-center text-white font-semibold text-xs">
                    {getInitials(user.name, user.email)}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe una respuesta..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30 resize-none text-sm transition-all"
                    rows={3}
                    disabled={submitting}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onReplySubmit(comment.id)}
                      disabled={!replyText.trim() || submitting}
                      className="px-4 py-2 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Responder
                    </button>
                    <button
                      onClick={() => {
                        setReplyingToId(null);
                        setReplyText("");
                      }}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Respuestas */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
              <div className="text-xs text-white/50 font-medium mb-2">
                {comment.replies.length} {comment.replies.length === 1 ? "respuesta" : "respuestas"}
              </div>
              {repliesToShow.map((reply) => (
                <div key={reply.id} className="flex gap-3 pl-4 border-l-2 border-[#00b2de]/30">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#00b2de] flex items-center justify-center text-white font-semibold text-xs">
                      {getInitials(reply.user.name, reply.user.email)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-white font-semibold text-xs">
                            {reply.user.name || reply.user.email.split("@")[0]}
                          </p>
                          <span className="text-white/40">•</span>
                          <p className="text-white/60 text-xs">{formatDate(reply.createdAt)}</p>
                        </div>
                      </div>
                      {user && user.id === reply.user.id && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => onEdit(reply.id, reply.text)}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                            title="Editar respuesta"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <button
                            onClick={() => onDelete(reply.id)}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                            title="Eliminar respuesta"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-white/70" />
                          </button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === reply.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30 resize-none text-xs transition-all"
                          rows={2}
                          disabled={submitting}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdate(reply.id)}
                            disabled={!editText.trim() || submitting}
                            className="px-3 py-1.5 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditText("");
                            }}
                            className="px-3 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap break-words">
                        {reply.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {hasMoreReplies && !showAllReplies && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      setExpandedReplies((prev) => new Set(prev).add(comment.id));
                    }}
                    className="px-3 py-1.5 text-[#00b2de] hover:text-[#00a0c8] transition-colors text-xs font-medium"
                  >
                    Ver {comment.replies.length - repliesLimit} respuesta{comment.replies.length - repliesLimit > 1 ? "s" : ""} más
                  </button>
                </div>
              )}
              {hasMoreReplies && showAllReplies && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      setExpandedReplies((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(comment.id);
                        return newSet;
                      });
                    }}
                    className="px-3 py-1.5 text-white/60 hover:text-white/80 transition-colors text-xs font-medium"
                  >
                    Mostrar menos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
