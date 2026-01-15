/**
 * Database Configuration Utility
 * Detects database provider and provides helper functions
 */

export const DATABASE_PROVIDER = (process.env.DATABASE_PROVIDER || "mysql").toLowerCase()
export const IS_SQLITE = DATABASE_PROVIDER === "sqlite"
export const IS_MYSQL = DATABASE_PROVIDER === "mysql"

/**
 * Get appropriate text type for current database
 * MySQL supports @db.Text and @db.LongText, SQLite doesn't need them
 */
export function getTextType(size: 'text' | 'longtext' = 'text'): string {
    if (IS_MYSQL) {
        return size === 'longtext' ? '@db.LongText' : '@db.Text'
    }
    return '' // SQLite doesn't need type annotations
}

/**
 * Check if full-text search is supported
 */
export function supportsFullTextSearch(): boolean {
    return IS_MYSQL
}

/**
 * Get database-specific configuration
 */
export function getDatabaseConfig() {
    return {
        provider: DATABASE_PROVIDER,
        isSQLite: IS_SQLITE,
        isMySQL: IS_MYSQL,
        supportsFullText: supportsFullTextSearch(),
        supportsTransactions: true, // Both support transactions
        supportsJson: true, // Both support JSON
    }
}

/**
 * Validate database connection string
 */
export function validateDatabaseUrl(url: string): { valid: boolean; error?: string } {
    if (!url) {
        return { valid: false, error: 'DATABASE_URL is not set' }
    }

    if (IS_MYSQL) {
        if (!url.startsWith('mysql://') && !url.startsWith('mysql+ssl://')) {
            return { valid: false, error: 'MySQL URL must start with mysql:// or mysql+ssl://' }
        }
    }

    if (IS_SQLITE) {
        if (!url.startsWith('file:')) {
            return { valid: false, error: 'SQLite URL must start with file:' }
        }
    }

    return { valid: true }
}

/**
 * Log database configuration on startup
 */
export function logDatabaseConfig() {
    const config = getDatabaseConfig()
    console.log('📊 Database Configuration:')
    console.log(`   Provider: ${config.provider}`)
    console.log(`   Full-text search: ${config.supportsFullText ? '✅' : '❌'}`)

    const validation = validateDatabaseUrl(process.env.DATABASE_URL || '')
    if (!validation.valid) {
        console.error(`   ⚠️  Warning: ${validation.error}`)
    }
}
