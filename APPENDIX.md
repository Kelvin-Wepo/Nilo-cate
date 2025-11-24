# Appendix

## A. Technology Stack
- **Backend:** Django 5, Django REST Framework, Celery, Redis, PostgreSQL
- **Frontend:** React 18, Tailwind CSS, React Router
- **APIs:** Google Maps, NASA FIRMS, Africa’s Talking, M-Pesa, Gemini AI
- **DevOps:** Render.com, GitHub, Gunicorn, WhiteNoise

## B. Key Features
- Community-driven campaigns for tree planting and conservation
- Real-time sensor and satellite data integration
- AI-powered tree health analysis
- Transparent funding and milestone tracking
- Blockchain-verified reporting
- Mobile-first responsive design

## C. Environment Variables
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `DATABASE_URL` (production), `DB_NAME`, `DB_USER`, `DB_PASSWORD` (development)
- API keys for Google Maps, Gemini, NASA FIRMS, Africa’s Talking, M-Pesa

## D. Deployment Notes
- Use `requirements-prod.txt` for production
- Pin Python version to 3.11.x for compatibility
- Ensure `DATABASE_URL` is set in Render environment
- Use Gunicorn for serving Django in production

## E. Troubleshooting
- Pillow build errors: Use Pillow 10.4.0 with Python 3.11
- psycopg2 errors: Use only `psycopg2-binary`
- Database errors: Check `DATABASE_URL` and `dj-database-url` version
- CORS errors: Update `CORS_ALLOWED_ORIGINS` in Django settings

## F. References
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Render Deployment Guide](https://render.com/docs)
- [Nilocate Pitch Deck](https://gamma.app/docs/NILOCATE-pfku5fac94mrk5i)
