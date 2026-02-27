"use client"
import { useEffect, useState } from "react"
import "./infoBookModal.css"
import { getBookMetadataByISBN } from "../../api/book"
import {
    X,
    BookOpen,
    Calendar,
    User,
    Tag,
    Hash,
    Building,
    FileText,
    ToggleLeft,
    ToggleRight,
    Loader2,
} from "lucide-react"

function InfoBookModal({ isOpen, onClose, book }) {
    const [googleData, setGoogleData] = useState(null)
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)

    useEffect(() => {
        const fetchGoogleMetadata = async () => {
            if (!book?.isbn) {
                setGoogleData(null)
                return
            }

            setIsLoadingGoogle(true)
            try {
                const result = await getBookMetadataByISBN(book.isbn)
                if (result.success && result.data) {
                    setGoogleData(result.data)
                } else {
                    setGoogleData(null)
                }
            } catch (error) {
                console.error("Error fetching Google Books data:", error)
                setGoogleData(null)
            } finally {
                setIsLoadingGoogle(false)
            }
        }

        if (isOpen && book) {
            fetchGoogleMetadata()
        } else {
            setGoogleData(null)
        }
    }, [isOpen, book])

    if (!isOpen || !book) return null

    // Use Google data if available, otherwise fall back to original book data
    const displayData = {
        title: googleData?.title || book.title,
        author: googleData?.author || book.author,
        genre: googleData?.genre || book.genre,
        description: googleData?.description || book.description,
        published_year: googleData?.published_year || book.published_year,
        published_date: googleData?.published_date || null, // Add this line
        // Keep original data for these fields as they're library-specific
        isbn: book.isbn,
        department: book.department,
        availability: book.availability,
        content: book.content,
        added_by: book.added_by,
        id: book.id,
        created_at: book.created_at,
        updated_at: book.updated_at,
        cover: book.cover,
    }

    // Helper function to format the published date
    const formatPublishedDate = (dateString) => {
        if (!dateString) return null

        try {
            // Handle different date formats from Google Books API
            if (dateString.length === 4) {
                // Just year: "1997"
                return dateString
            } else if (dateString.length === 7) {
                // Year-Month: "1997-06"
                const date = new Date(dateString + "-01")
                return date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
            } else if (dateString.length >= 10) {
                // Full date: "1997-06-26"
                const date = new Date(dateString)
                return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })
            }
            return dateString
        } catch (error) {
            console.error("Error formatting date:", error)
            return dateString
        }
    }

    return (
        <div className="info-modal-overlay" onClick={onClose}>
            <div className="info-book-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="info-modal-header">
                    <div className="header-icon-wrapper">
                        <BookOpen size={24} className="header-icon" />
                    </div>
                    <h2>Book Information</h2>
                    {isLoadingGoogle && (
                        <div className="google-loading">
                            <Loader2 size={16} className="loading-spinner" />
                            <span>Fetching details...</span>
                        </div>
                    )}
                    <button className="info-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="info-modal-content">
                    {/* Book Cover and Basic Info */}
                    <div className="book-overview">
                        <div className="book-cover-large">
                            {displayData.cover ? (
                                <img
                                    src={`http://localhost:3000/covers/${encodeURIComponent(displayData.cover)}`}
                                    alt={`${displayData.title} cover`}
                                    onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = "http://localhost:3000/covers/Lorem Ipsum.png"
                                    }}
                                />
                            ) : (
                                <div className="cover-placeholder-large">
                                    <BookOpen size={64} />
                                </div>
                            )}
                        </div>
                        <div className="book-basic-info">
                            <h3 className="info-book-title">
                                {displayData.title}
                                {googleData?.title && googleData.title !== book.title && <span className="google-enhanced">✨</span>}
                            </h3>
                            <p className="info-book-author">
                                by {displayData.author}
                                {googleData?.author && googleData.author !== book.author && <span className="google-enhanced">✨</span>}
                            </p>
                            <div className={`info-availability-badge ${displayData.availability}`}>
                                {displayData.availability === "available" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                <span>{displayData.availability === "available" ? "Available" : "Unavailable"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Source Indicator */}
                    {googleData && (
                        <div className="data-source-indicator">
                            <span className="google-badge">✨ Enhanced with Google Books data</span>
                        </div>
                    )}

                    {/* Detailed Information */}
                    <div className="book-details-grid">
                        <div className="detail-item">
                            <div className="detail-icon">
                                <Hash size={16} />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">ISBN</span>
                                <span className="detail-value">{displayData.isbn}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon">
                                <Tag size={16} />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">Genre</span>
                                <span className="detail-value">
                                    {displayData.genre}
                                    {googleData?.genre && googleData.genre !== book.genre && (
                                        <span className="google-enhanced-small">✨</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon">
                                <Building size={16} />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">Department</span>
                                <span className="detail-value">{displayData.department}</span>
                            </div>
                        </div>

                        {(displayData.published_date || displayData.published_year) && (
                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Calendar size={16} />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Published Date</span>
                                    <span className="detail-value">
                                        {displayData.published_date
                                            ? formatPublishedDate(displayData.published_date)
                                            : displayData.published_year}
                                        {googleData?.published_date && <span className="google-enhanced-small">✨</span>}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="detail-item">
                            <div className="detail-icon">
                                <FileText size={16} />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">Content Available</span>
                                <span className="detail-value">{displayData.content ? "Yes" : "No"}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon">
                                <User size={16} />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">Added By</span>
                                <span className="detail-value">{displayData.added_by || "Admin"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {displayData.description && (
                        <div className="book-description-section">
                            <h4>
                                Description
                                {googleData?.description && googleData.description !== book.description && (
                                    <span className="google-enhanced-small">✨ Enhanced</span>
                                )}
                            </h4>
                            <p className="full-description">{displayData.description}</p>
                        </div>
                    )}

                    {/* Additional Metadata */}
                    <div className="metadata-section">
                        <h4>Library Information</h4>
                        <div className="metadata-grid">
                            <div className="metadata-item">
                                <span className="metadata-label">Book ID:</span>
                                <span className="metadata-value">{displayData.id}</span>
                            </div>
                            {displayData.created_at && (
                                <div className="metadata-item">
                                    <span className="metadata-label">Added on:</span>
                                    <span className="metadata-value">{new Date(displayData.created_at).toLocaleDateString()}</span>
                                </div>
                            )}
                            {displayData.updated_at && (
                                <div className="metadata-item">
                                    <span className="metadata-label">Last updated:</span>
                                    <span className="metadata-value">{new Date(displayData.updated_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Original vs Enhanced Data Comparison */}
                    {googleData && (
                        <div className="data-comparison">
                            <h4>Data Enhancement Details</h4>
                            <div className="comparison-grid">
                                {googleData.title && googleData.title !== book.title && (
                                    <div className="comparison-item">
                                        <span className="comparison-label">Title:</span>
                                        <div className="comparison-values">
                                            <span className="original-value">Original: {book.title}</span>
                                            <span className="enhanced-value">Enhanced: {googleData.title} ✨</span>
                                        </div>
                                    </div>
                                )}
                                {googleData.author && googleData.author !== book.author && (
                                    <div className="comparison-item">
                                        <span className="comparison-label">Author:</span>
                                        <div className="comparison-values">
                                            <span className="original-value">Original: {book.author}</span>
                                            <span className="enhanced-value">Enhanced: {googleData.author} ✨</span>
                                        </div>
                                    </div>
                                )}
                                {googleData.genre && googleData.genre !== book.genre && (
                                    <div className="comparison-item">
                                        <span className="comparison-label">Genre:</span>
                                        <div className="comparison-values">
                                            <span className="original-value">Original: {book.genre}</span>
                                            <span className="enhanced-value">Enhanced: {googleData.genre} ✨</span>
                                        </div>
                                    </div>
                                )}
                                {googleData?.published_date && googleData.published_date !== book.published_year && (
                                    <div className="comparison-item">
                                        <span className="comparison-label">Published Date:</span>
                                        <div className="comparison-values">
                                            <span className="original-value">Original: {book.published_year || "Not specified"}</span>
                                            <span className="enhanced-value">
                                                Enhanced: {formatPublishedDate(googleData.published_date)} ✨
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="info-modal-footer">
                    <button className="close-info-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InfoBookModal
