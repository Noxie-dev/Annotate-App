# Document Library

The Document Library is a comprehensive file management system for the Annotator App that allows users to organize, upload, and manage their PDF documents in a hierarchical folder structure.

## Features

### File Management
- **Upload Files**: Drag and drop or click to upload PDF files
- **Folder Organization**: Create nested folders to organize documents
- **File Operations**: Delete, share, and download files
- **Search**: Real-time search across files and folders
- **Breadcrumb Navigation**: Easy navigation through folder hierarchy

### User Interface
- **Dark Theme**: Consistent with the app's dark theme design
- **Grid Layout**: Responsive grid layout for files and folders
- **Visual Indicators**: Icons showing file types and access levels
- **Hover Effects**: Interactive hover states for better UX

### Access Control
- **Private**: Files visible only to the owner
- **View Only**: Files that can be viewed but not edited
- **Edit**: Files that can be viewed and edited
- **Public**: Files accessible to everyone

### File Sharing
- **Share Modal**: Easy sharing interface with access level controls
- **Email Sharing**: Share files via email addresses
- **Access Level Management**: Control what recipients can do with shared files

## Usage

### Navigation
- Access the Document Library from the main navigation
- Use breadcrumbs to navigate between folders
- Click the back arrow to go up one level

### File Operations
- **Upload**: Click "Upload Files" or drag files into the interface
- **Create Folder**: Click "New Folder" and enter a name
- **Select Items**: Click checkboxes or click items to select
- **Delete**: Select items and click the delete button
- **Share**: Click the share icon on any file
- **Open**: Double-click any file to open it in the document viewer

### Search
- Use the search bar to find files and folders by name
- Search works across all levels of the folder hierarchy
- Results are filtered in real-time as you type

## Technical Implementation

### Components
- **DocLibraryPage**: Main component handling state and UI
- **File Cards**: Individual file display components
- **Folder Cards**: Folder display components
- **Modals**: Create folder and share modals

### State Management
- Local state using React hooks
- File and folder data structure
- Selection state for bulk operations
- Modal visibility state

### File Handling
- Drag and drop support
- File type validation (PDF only)
- File size display
- Upload progress (ready for implementation)

### Responsive Design
- Grid layout adapts to screen size
- Mobile-friendly interface
- Touch-friendly interactions

## Future Enhancements

### Planned Features
- **File Preview**: Quick preview of PDF files
- **Bulk Operations**: Move, copy, and organize multiple files
- **File Versioning**: Track file versions and changes
- **Advanced Search**: Search by content, tags, and metadata
- **Collaboration**: Real-time collaboration on file organization
- **File Comments**: Add comments and notes to files
- **Favorites**: Mark frequently used files as favorites
- **Recent Files**: Quick access to recently accessed files

### Integration Points
- **Document Viewer**: Seamless integration with the PDF viewer
- **Authentication**: User-based file access and permissions
- **API Integration**: Backend integration for file storage
- **Real-time Updates**: Live updates when files are shared or modified

## Accessibility

The Document Library follows accessibility best practices:
- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast design for better visibility
- Focus indicators for keyboard users

## Performance

### Optimizations
- Lazy loading for large file lists
- Efficient search algorithms
- Optimized re-renders with React hooks
- Responsive image loading
- Minimal bundle size impact

### Scalability
- Designed to handle large numbers of files
- Efficient folder navigation
- Pagination ready (for future implementation)
- Search indexing ready
