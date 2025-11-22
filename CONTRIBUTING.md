# Contributing to Nilocate

Thank you for your interest in contributing to Nilocate! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Nilo-cate.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m "Add your commit message"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Guidelines

### Backend (Django)

- Follow PEP 8 style guidelines
- Write docstrings for all functions and classes
- Add tests for new features
- Update API documentation when adding new endpoints
- Keep models simple and focused
- Use Django REST Framework best practices

### Frontend (React)

- Use functional components with hooks
- Follow React best practices
- Keep components small and reusable
- Use meaningful variable and component names
- Add comments for complex logic
- Ensure responsive design works on mobile

## Code Style

### Python
```python
# Good
def analyze_tree_health(image_path):
    """
    Analyze tree health from image.
    
    Args:
        image_path: Path to tree image
        
    Returns:
        dict: Analysis results
    """
    pass
```

### JavaScript
```javascript
// Good
const analyzeTreeHealth = async (imagePath) => {
  // Analyze tree health
  const result = await api.post('/analyze', { image: imagePath });
  return result.data;
};
```

## Testing

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm test
```

## Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Keep the first line under 50 characters
- Add detailed description if needed

Examples:
```
Add AI analysis endpoint for tree health
Fix map marker display issue
Update species information page layout
```

## Pull Request Process

1. Update README.md or documentation if needed
2. Ensure all tests pass
3. Update CHANGELOG.md with your changes
4. Request review from maintainers
5. Address any review comments
6. Once approved, your PR will be merged

## Feature Requests

- Open an issue describing the feature
- Explain why it would be beneficial
- Discuss implementation approach
- Wait for approval before starting work

## Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, browser, etc.)

## Questions?

Open an issue with the "question" label or reach out to the maintainers.

Thank you for contributing to Nilocate and helping protect endangered trees! 🌳
