import { useState, useMemo, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Search, Download, BookOpen, Star, Filter, Heart, User, Clock } from 'lucide-react';
import coverImg from './assets/cover.png';
import solutionPdf from './assets/Solution 1.pdf';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverUrl: string;
  fileUrl: string;
  rating: number;
  downloads: number;
  fileSize: string;
  pages: number;
  publishYear: number;
  isFavorite: boolean;
}

const sampleBooks: Book[] = [
  {
    id: 1,
    title: "Tu es une solution de Dieu pour ta génération",
    author: "Samuel M. Dalum",
    genre: "Développement personnel chrétien / Littérature chrétienne pour la jeunesse",
    description: "Ce livre est un appel prophétique à une génération en quête de sens. Il s'adresse en particulier aux jeunes, souvent désorientés ou blessés, en les appelant à se reconnecter à leur identité divine et à leur mission spirituelle. L'auteur partage un message puissant de réveil, de restauration et d’engagement à travers une écriture accessible, profonde et inspirée de la Bible. Il ne s'agit pas d’un simple ouvrage religieux, mais d’un véritable guide pour ceux qui veulent marcher avec Dieu avec authenticité, feu et impact dans leur génération.",
    coverUrl: coverImg,
    fileUrl: solutionPdf,
    rating: 4.8,
    downloads: 0,
    fileSize: "458 Ko",
    pages: 58,
    publishYear: 2025,
    isFavorite: false
  },
  // {
  //   id: 2,
  //   title: "1984",
  //   author: "George Orwell",
  //   genre: "Science-Fiction",
  //   description: "Un roman dystopique qui explore les thèmes de la surveillance, de la manipulation et du totalitarisme dans une société futuriste oppressive.",
  //   coverUrl: "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg",
  //   rating: 4.7,
  //   downloads: 23180,
  //   fileSize: "3.4 MB",
  //   pages: 328,
  //   publishYear: 1949,
  //   isFavorite: true
  // },
  // {
  //   id: 3,
  //   title: "L'Étranger",
  //   author: "Albert Camus",
  //   genre: "Philosophie",
  //   description: "L'histoire de Meursault, un homme indifférent qui commet un meurtre apparemment sans motif, explorant l'absurdité de l'existence.",
  //   coverUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg",
  //   rating: 4.5,
  //   downloads: 18750,
  //   fileSize: "1.8 MB",
  //   pages: 159,
  //   publishYear: 1942,
  //   isFavorite: false
  // },
  // {
  //   id: 4,
  //   title: "Pride and Prejudice",
  //   author: "Jane Austen",
  //   genre: "Romance",
  //   description: "L'histoire d'Elizabeth Bennet et de Mr. Darcy, une comédie romantique sur l'amour, les préjugés et les conventions sociales de l'époque.",
  //   coverUrl: "https://images.pexels.com/photos/1261180/pexels-photo-1261180.jpeg",
  //   rating: 4.6,
  //   downloads: 31200,
  //   fileSize: "4.2 MB",
  //   pages: 432,
  //   publishYear: 1813,
  //   isFavorite: true
  // },
  // {
  //   id: 5,
  //   title: "Les Misérables",
  //   author: "Victor Hugo",
  //   genre: "Historique",
  //   description: "Une fresque épique de la France du XIXe siècle, suivant Jean Valjean dans sa quête de rédemption à travers les bouleversements sociaux.",
  //   coverUrl: "https://images.pexels.com/photos/1309899/pexels-photo-1309899.jpeg",
  //   rating: 4.9,
  //   downloads: 27800,
  //   fileSize: "8.7 MB",
  //   pages: 1463,
  //   publishYear: 1862,
  //   isFavorite: false
  // },
  // {
  //   id: 6,
  //   title: "To Kill a Mockingbird",
  //   author: "Harper Lee",
  //   genre: "Fiction",
  //   description: "L'histoire de Scout Finch et de son père avocat Atticus, explorant les thèmes du racisme et de la justice dans le Sud américain.",
  //   coverUrl: "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg",
  //   rating: 4.8,
  //   downloads: 19500,
  //   fileSize: "3.1 MB",
  //   pages: 376,
  //   publishYear: 1960,
  //   isFavorite: false
  // }
];

function App() {
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
    const [downloadingBooks, setDownloadingBooks] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Try to fetch the current download count from the database
        let data;
        
        // First try to get existing data
        const result = await supabase
          .from('books')
          .select('download_count')
          .eq('id', 1)
          .single();
        
        data = result.data;
        const error = result.error;

        // If the book doesn't exist in the database, create it with 0 downloads
        if (error && error.code === 'PGRST116') {
          console.log('Book not found, creating initial entry...');
          const { data: newData, error: insertError } = await supabase
            .from('books')
            .insert({ id: 1, download_count: 0 })
            .select('download_count')
            .single();

          if (insertError) {
            console.error('Error creating book entry:', insertError);
            // Fall back to local storage if database operation fails
            const localDownloads = localStorage.getItem('book_1_downloads');
            if (localDownloads) {
              setBooks(prevBooks =>
                prevBooks.map(book =>
                  book.id === 1 ? { ...book, downloads: parseInt(localDownloads) } : book
                )
              );
            }
            return;
          }
          data = newData;
        } else if (error) {
          console.error('Error fetching download count:', error);
          // Fall back to local storage if database fetch fails
          const localDownloads = localStorage.getItem('book_1_downloads');
          if (localDownloads) {
            setBooks(prevBooks =>
              prevBooks.map(book =>
                book.id === 1 ? { ...book, downloads: parseInt(localDownloads) } : book
              )
            );
          }
          return;
        }

        // Update the state with the fetched or newly created count
        if (data) {
          setBooks(prevBooks =>
            prevBooks.map(book =>
              book.id === 1 ? { ...book, downloads: data.download_count } : book
            )
          );
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        // Fall back to local storage for any unexpected errors
        const localDownloads = localStorage.getItem('book_1_downloads');
        if (localDownloads) {
          setBooks(prevBooks =>
            prevBooks.map(book =>
              book.id === 1 ? { ...book, downloads: parseInt(localDownloads) } : book
            )
          );
        }
      }
    };

    fetchInitialData();
  }, []);

  const genres = useMemo(() => {
    const allGenres = books.map(book => book.genre);
    return ['Tous', ...Array.from(new Set(allGenres))];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === '' || selectedGenre === 'Tous' || book.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [books, searchTerm, selectedGenre]);

  const handleDownload = async (bookId: number, fileUrl: string) => {
    // Start the loading indicator
    setDownloadingBooks(prev => new Set(prev).add(bookId));

    // Trigger the actual file download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      // Try to update the download count in the database
      const { error } = await supabase.rpc('increment_download_count', {
        book_id_to_update: bookId,
      });

      if (error) {
        console.error('Error incrementing download count in database:', error);
        // Fall back to local storage if database update fails
        const localDownloads = parseInt(localStorage.getItem(`book_${bookId}_downloads`) || '0') + 1;
        localStorage.setItem(`book_${bookId}_downloads`, localDownloads.toString());
        
        // Update the UI with the new count from local storage
        setBooks(prev => prev.map(book =>
          book.id === bookId ? { ...book, downloads: localDownloads } : book
        ));
      } else {
        // Update the local state to show the new count from database
        setBooks(prev => prev.map(book =>
          book.id === bookId ? { ...book, downloads: book.downloads + 1 } : book
        ));
      }
    } catch (err) {
      console.error('Unexpected error during download count update:', err);
      // Fall back to local storage for any unexpected errors
      const localDownloads = parseInt(localStorage.getItem(`book_${bookId}_downloads`) || '0') + 1;
      localStorage.setItem(`book_${bookId}_downloads`, localDownloads.toString());
      
      // Update the UI with the new count from local storage
      setBooks(prev => prev.map(book =>
        book.id === bookId ? { ...book, downloads: localDownloads } : book
      ));
    } finally {
      // Always stop the loading indicator
      setDownloadingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  const toggleFavorite = (bookId: number) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, isFavorite: !book.isFavorite } : book
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-full">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Samuel Dalum Books</h1>
                <p className="text-blue-600 text-sm">Votre bibliothèque numérique</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{books.length}</div>
                <div className="text-xs text-blue-600">Livres</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {books.reduce((sum, book) => sum + book.downloads, 0).toLocaleString()}
                </div>
                <div className="text-xs text-blue-600">Téléchargements</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-yellow-400">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un livre ou un auteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
                />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 appearance-none bg-white"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre === 'Tous' ? '' : genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-blue-800 font-medium">
            {filteredBooks.length} livre{filteredBooks.length !== 1 ? 's' : ''} trouvé{filteredBooks.length !== 1 ? 's' : ''}
            {searchTerm && <span className="text-yellow-600"> pour "{searchTerm}"</span>}
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-t-4 border-yellow-400"
            >
              <div className="relative">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(book.id)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
                    book.isFavorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${book.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <div className="absolute bottom-4 left-4 bg-blue-900/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {book.genre}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2 line-clamp-2">
                  {book.title}
                </h3>
                <div className="flex items-center text-blue-600 mb-3">
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{book.author}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {book.description}
                </p>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{book.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    <span>{book.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{book.pages} pages</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                  <span>Publié en {book.publishYear}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{book.fileSize}</span>
                </div>

                <button
                  onClick={() => handleDownload(book.id, book.fileUrl)}
                  disabled={downloadingBooks.has(book.id)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    downloadingBooks.has(book.id)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white transform hover:scale-105'
                  }`}
                >
                  {downloadingBooks.has(book.id) ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                      <span>Téléchargement...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>Télécharger</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun livre trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-yellow-400 p-2 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-900" />
              </div>
              <h3 className="text-2xl font-bold">Samuel Dalum Books</h3>
            </div>
            <p className="text-blue-200 mb-4">
              Découvrez, téléchargez et savourez les meilleurs livres du monde entier
            </p>
            <div className="flex justify-center space-x-8 text-sm text-blue-200">
              <span>© 2024 Samuel Dalum Books</span>
              <span>•</span>
              <span>Tous droits réservés</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;