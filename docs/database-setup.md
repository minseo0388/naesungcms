# Database Provider Selection Guide

## Quick Start

### Option 1: MySQL (Production-like)

1. **Start MySQL via Docker**:
```bash
docker compose up -d
```

2. **Configure environment** (`.env`):
```env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://root:root@localhost:3306/naesungcms"
```

3. **Run migrations**:
```bash
npx prisma migrate dev
```

4. **Start development server**:
```bash
npm run dev
```

---

### Option 2: SQLite (Simple, No Setup)

1. **Configure environment** (`.env`):
```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

2. **Run migrations**:
```bash
npx prisma migrate dev
```

3. **Start development server**:
```bash
npm run dev
```

---

## Switching Between Databases

1. **Stop the development server**

2. **Update `.env`**:
   - Change `DATABASE_PROVIDER` to `"mysql"` or `"sqlite"`
   - Update `DATABASE_URL` accordingly

3. **Reset database** (optional, if switching):
```bash
npx prisma migrate reset
```

4. **Restart server**:
```bash
npm run dev
```

---

## Feature Compatibility

| Feature | MySQL | SQLite |
|---------|-------|--------|
| Full-text search | ✅ | ❌ |
| Transactions | ✅ | ✅ |
| JSON fields | ✅ | ✅ |
| Relations | ✅ | ✅ |
| Migrations | ✅ | ✅ |

**Note**: Full-text search (`@@fulltext`) only works with MySQL. SQLite will use basic `contains` queries instead.

---

## Production Deployment

### MySQL (Recommended)
- Use managed MySQL (PlanetScale, AWS RDS, etc.)
- Enable SSL connections
- Use strong passwords
- Regular backups

### SQLite
- **Not recommended for production** with multiple servers
- OK for single-server deployments
- Ensure regular backups
- Consider file locking issues

---

## Troubleshooting

### "Provider not found" error
**Solution**: Make sure `DATABASE_PROVIDER` is set in `.env`

### Migration fails
**Solution**: 
1. Check `DATABASE_URL` is correct
2. For MySQL: Ensure database exists
3. For SQLite: Ensure write permissions

### Full-text search not working
**Solution**: Full-text search only works with MySQL. SQLite uses basic text search.
