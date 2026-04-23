import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import { getCategories, createCategory, deleteCategory } from '../services/adminApi' // ← Added deleteCategory

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null) // Track which category is being deleted
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data || [])
      setError('')
    } catch (err) {
      setError('वर्गहरु लोड गर्न विफल: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'name') {
      const newSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: newSlug
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name) {
      setError('कृपया वर्गको नाम प्रविष्ट गर्नुहोस्')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await createCategory({
        name: formData.name,
        slug: formData.slug,
        description: formData.description
      })
      
      // Reset form and refresh list
      setFormData({ name: '', slug: '', description: '' })
      setShowForm(false)
      await fetchCategories()
    } catch (err) {
      setError('वर्ग बनाउन विफल: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ✅ Add delete handler
  const handleDelete = async (id, name) => {
    // Confirm deletion
    if (!window.confirm(`के तपाईं पक्का " ${name} " वर्ग मेट्न चाहनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।`)) {
      return
    }

    setDeletingId(id)
    setError('')

    try {
      await deleteCategory(id)
      await fetchCategories() // Refresh the list
    } catch (err) {
      setError('वर्ग मेट्न विफल: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">समाचार वर्गहरु</h1>
          <p className="text-slate-400">सबै समाचार वर्गहरु व्यवस्थापन गर्नुहोस्</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">नयाँ वर्ग बनाउनुहोस्</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-white font-semibold mb-3">वर्गको नाम *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="जस्तैः बजार, खेल, राजनीति"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-white font-semibold mb-3">स्लग (URL)</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="स्वचालित गरिन्छ"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    disabled
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-semibold mb-3">विवरण</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="यस वर्गको बारेमा छोटो विवरण"
                  rows="3"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ name: '', slug: '', description: '' })
                  }}
                  className="flex-1 px-6 py-3 bg-slate-600/50 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  {submitting ? 'बनाउँदैछ...' : 'वर्ग बनाउनुहोस्'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Category Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            नयाँ वर्ग थप्नुहोस्
          </button>
        )}

        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="वर्गहरु खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center">
              <p className="text-slate-400">वर्गहरु लोड हुँदैछ...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center">
              <p className="text-slate-400">
                {searchTerm ? 'कुनै वर्ग फेला परेन' : 'अभी कुनै वर्ग छैन। नयाँ वर्ग बनाउन सुरु गर्नुहोस्।'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map(category => (
                <div
                  key={category.id}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl hover:bg-white/15 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">/{category.slug}</p>
                    </div>
                  </div>
                  
                  {category.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                      ID: {category.id}
                    </span>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={deletingId === category.id}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50"
                      title="वर्ग मेट्नुहोस्"
                    >
                      {deletingId === category.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl text-center">
            <p className="text-slate-400 text-sm">कुल वर्गहरु</p>
            <p className="text-4xl font-bold text-purple-300 mt-2">{categories.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories