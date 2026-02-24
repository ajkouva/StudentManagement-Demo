const authService = require('../src/services/auth.service');
const pool = require('../src/db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock external dependencies
jest.mock('../src/db/db', () => ({
    query: jest.fn(),
    connect: jest.fn()
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loginUser', () => {
        it('should throw "Wrong email or password" if user does not exist', async () => {
            // Mock DB returning 0 rows
            pool.query.mockResolvedValue({ rows: [] });

            await expect(authService.loginUser({ email: 'test@test.com', password: 'password123' }))
                .rejects
                .toThrow('Wrong email or password');
        });

        it('should throw "Wrong email or password" if password does not match', async () => {
            // Mock DB returning a user
            pool.query.mockResolvedValue({
                rows: [{ id: 1, email: 'test@test.com', role: 'STUDENT', password_hash: 'hashedpass' }]
            });
            // Mock bcrypt returning false
            bcrypt.compare.mockResolvedValue(false);

            await expect(authService.loginUser({ email: 'test@test.com', password: 'wrongpassword' }))
                .rejects
                .toThrow('Wrong email or password');
        });

        it('should return user and token if credentials match', async () => {
            // Mock DB returning a user
            const mockUser = { id: 1, email: 'test@test.com', role: 'STUDENT', password_hash: 'hashedpass', name: 'Test' };
            pool.query.mockResolvedValue({ rows: [mockUser] });
            // Mock bcrypt returning true
            bcrypt.compare.mockResolvedValue(true);
            // Mock JWT signing
            jwt.sign.mockReturnValue('mock-token');

            const result = await authService.loginUser({ email: 'test@test.com', password: 'correctpassword' });

            expect(result.user).toEqual(mockUser);
            expect(result.token).toBe('mock-token');
            expect(jwt.sign).toHaveBeenCalled();
        });
    });

    describe('registerUser', () => {
        let mockClient;

        beforeEach(() => {
            mockClient = {
                query: jest.fn(),
                release: jest.fn()
            };
            pool.connect.mockResolvedValue(mockClient);
        });

        it('should throw if email already exists', async () => {
            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
            await expect(authService.registerUser({ name: 'n', email: 'e', password: 'p', subject: 's' }))
                .rejects.toThrow('User with this email already exists');
        });

        it('should rollback and throw if unique constraint error occurs', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockImplementationOnce(() => Promise.resolve()); // BEGIN

            const error = new Error('Constraint');
            error.code = '23505';
            mockClient.query.mockImplementationOnce(() => Promise.reject(error)); // INSERT fails

            await expect(authService.registerUser({ name: 'n', email: 'e', password: 'p', subject: 's' }))
                .rejects.toThrow('User with this email already exists');

            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should rollback and throw generic error', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });
            mockClient.query.mockImplementationOnce(() => Promise.resolve());
            mockClient.query.mockImplementationOnce(() => Promise.reject(new Error('Generic db error')));

            await expect(authService.registerUser({ name: 'n', email: 'e', password: 'p', subject: 's' }))
                .rejects.toThrow('Generic db error');

            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should commit, release, and return token on success', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });
            bcrypt.hash.mockResolvedValue('hashed');
            mockClient.query.mockResolvedValue(); // All queries succeed
            jwt.sign.mockReturnValue('mock-token');

            const token = await authService.registerUser({ name: 'n', email: 'e', password: 'p', subject: 's' });

            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
            expect(token).toBe('mock-token');
        });
    });

    describe('getUserDetails', () => {
        it('should throw User not found if no rows returned', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });
            await expect(authService.getUserDetails('test@test.com'))
                .rejects.toThrow('User not found');
        });

        it('should return user details on success', async () => {
            const mockUser = { id: 1, name: 'T', email: 'e', role: 'STUDENT' };
            pool.query.mockResolvedValueOnce({ rows: [mockUser] });

            const result = await authService.getUserDetails('test@test.com');
            expect(result).toEqual(mockUser);
        });
    });
});
