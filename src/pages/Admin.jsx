import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addGame } from '@/services/gameService';

const Admin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    gameUrl: '',
    thumbnail: '',
    multiplayer: false,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Action',
    'Adventure',
    'Arcade',
    'Puzzle',
    'Racing',
    'RPG',
    'Sports',
    'Strategy',
    'Casual',
    'Other',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (
      !formData.title ||
      !formData.slug ||
      !formData.gameUrl ||
      !formData.thumbnail
    ) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);

      // Add game to Firestore
      console.log('Adding game to Firestore...');
      await addGame({
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        gameUrl: formData.gameUrl,
        thumbnail: formData.thumbnail,
        multiplayer: formData.multiplayer,
      });

      setSuccess('Game added successfully! Redirecting...');

      // Reset form
      setFormData({
        title: '',
        slug: '',
        description: '',
        category: '',
        gameUrl: '',
        thumbnail: '',
        multiplayer: false,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error adding game:', err);
      setError('Failed to add game: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background with gradient overlay */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(19, 16, 35, 0.85) 0%, rgba(19, 16, 35, 0.95) 100%), url("https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop")`,
        }}
      />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="border-b border-[#330df2]/20 bg-[#131022]/50 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                  ADD NEW GAME
                </h1>
                <p className="text-gray-400">
                  Upload game metadata to the library
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 border border-[#330df2]/50 text-gray-300 hover:text-white hover:border-[#330df2] transition-all rounded-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#131022]/70 backdrop-blur-sm border border-[#330df2]/20 rounded-lg shadow-2xl shadow-[#330df2]/10 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                {/* Game Title */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Game Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1729]/80 border border-[#330df2]/30 text-white rounded-lg focus:ring-2 focus:ring-[#330df2] focus:border-[#330df2] transition-all placeholder-gray-500"
                    placeholder="Tic Tac Toe"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Slug (URL-friendly) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1729]/80 border border-[#330df2]/30 text-white rounded-lg focus:ring-2 focus:ring-[#330df2] focus:border-[#330df2] transition-all placeholder-gray-500"
                    placeholder="tic-tac-toe"
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Only lowercase letters, numbers, and hyphens
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1729]/80 border border-[#330df2]/30 text-white rounded-lg focus:ring-2 focus:ring-[#330df2] focus:border-[#330df2] transition-all placeholder-gray-500 resize-none"
                    rows="4"
                    placeholder="Classic 3x3 grid game. Get three in a row to win!"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1729]/80 border border-[#330df2]/30 text-white rounded-lg focus:ring-2 focus:ring-[#330df2] focus:border-[#330df2] transition-all cursor-pointer"
                    required
                  >
                    <option value="" className="bg-[#1a1729]">
                      Select category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#1a1729]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Game URL */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Game URL (GitHub Pages){' '}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    name="gameUrl"
                    value={formData.gameUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1729]/80 border border-[#330df2]/30 text-white rounded-lg focus:ring-2 focus:ring-[#330df2] focus:border-[#330df2] transition-all placeholder-gray-500"
                    placeholder="https://username.github.io/game-library-games/tic-tac-toe/"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    URL to your game hosted on GitHub Pages
                  </p>
                </div>

                {/* Multiplayer Support */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="multiplayer"
                      checked={formData.multiplayer}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          multiplayer: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded border-[#330df2]/30 bg-[#1a1729]/80 text-[#330df2] focus:ring-2 focus:ring-[#330df2] cursor-pointer"
                    />
                    <div className="w-full">
                      <span className="text-sm font-semibold text-white">
                        Multiplayer Support
                      </span>
                      <p className="text-xs text-gray-400">
                        Enable if this game supports multiplayer mode
                      </p>
                    </div>
                  </label>
                </div>

                {/* Thumbnail URL */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Thumbnail Image URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a1729]/80 border border-[#330df2]/30 text-white rounded-lg focus:ring-2 focus:ring-[#330df2] focus:border-[#330df2] transition-all placeholder-gray-500"
                    placeholder="https://example.com/images/game-thumbnail.jpg"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Direct link to thumbnail image (Recommended: 1280x720px,
                    16:9 aspect ratio)
                  </p>

                  {/* Thumbnail Preview */}
                  {formData.thumbnail && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-white mb-2">
                        Preview:
                      </p>
                      <img
                        src={formData.thumbnail}
                        alt="Thumbnail preview"
                        className="w-full object-cover rounded-lg border-2 border-[#330df2]/50 shadow-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-[#330df2] text-white py-3 rounded-lg font-bold hover:bg-[#4a1fff] transition-all hover:shadow-lg hover:shadow-[#330df2]/50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        UPLOADING...
                      </span>
                    ) : (
                      'ADD GAME'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 border border-[#330df2]/50 text-gray-300 rounded-lg hover:bg-[#330df2]/10 hover:border-[#330df2] hover:text-white transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* Info Box */}
              {/* Info Box */}
              <div className="mt-8 p-6 bg-[#330df2]/10 border border-[#330df2]/30 rounded-lg backdrop-blur-sm">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#330df2]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Instructions
                </h3>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Upload your game to GitHub Pages first</li>
                  <li>
                    Get the live URL (e.g.,
                    username.github.io/game-repo/game-name/)
                  </li>
                  <li>Fill in the game details here</li>
                  <li>Upload a thumbnail image (1280x720px recommended)</li>
                  <li>Click "ADD GAME" to publish to the library</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
