import os
import sys
import unittest
import json

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app import create_app
from backend.config import Config

class SmartMazeBackendTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('operational', data['message'])

    def test_02_registration_validation(self):
        # Test short username
        res = self.client.post('/api/auth/register', json={
            'username': 'ab',
            'email': 'valid@smartmaze.io',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 400)
        self.assertFalse(res.get_json()['success'])

        # Test invalid email
        res = self.client.post('/api/auth/register', json={
            'username': 'testuser',
            'email': 'invalid-email',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 400)

        # Test short password
        res = self.client.post('/api/auth/register', json={
            'username': 'testuser',
            'email': 'valid@smartmaze.io',
            'password': '123'
        })
        self.assertEqual(res.status_code, 400)

    def test_03_registration_and_login_flow(self):
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        test_user = f"m13_user_{unique_id}"
        test_email = f"m13_{unique_id}@smartmaze.io"
        test_pass = "SecurePass123!"

        # 1. Register new user
        res = self.client.post('/api/auth/register', json={
            'username': test_user,
            'email': test_email,
            'password': test_pass
        })
        self.assertIn(res.status_code, [201, 200])
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['user']['name'], test_user)

        # 2. Check session
        res_sess = self.client.get('/api/auth/session')
        self.assertEqual(res_sess.status_code, 200)
        self.assertTrue(res_sess.get_json()['success'])

        # 3. Test duplicate registration
        res_dup = self.client.post('/api/auth/register', json={
            'username': test_user,
            'email': 'another@smartmaze.io',
            'password': test_pass
        })
        self.assertEqual(res_dup.status_code, 400)

        # 4. Logout
        res_logout = self.client.post('/api/auth/logout')
        self.assertEqual(res_logout.status_code, 200)

        # 5. Check session after logout
        res_sess_after = self.client.get('/api/auth/session')
        self.assertEqual(res_sess_after.status_code, 401)

        # 6. Login with correct credentials
        res_login = self.client.post('/api/auth/login', json={
            'identifier': test_user,
            'password': test_pass
        })
        self.assertEqual(res_login.status_code, 200)
        self.assertTrue(res_login.get_json()['success'])

        # 7. Level progress recording
        res_lvl = self.client.post('/api/progress/level', json={
            'levelId': 1,
            'completed': True,
            'time': 18,
            'moves': 10,
            'grade': 'S'
        })
        self.assertEqual(res_lvl.status_code, 200)
        self.assertTrue(res_lvl.get_json()['data']['nextLevelUnlocked'])

        # 8. Best Time Rule check: replay with worse time (30s > 18s)
        res_lvl_worse = self.client.post('/api/progress/level', json={
            'levelId': 1,
            'completed': True,
            'time': 30,
            'moves': 15,
            'grade': 'B'
        })
        self.assertEqual(res_lvl_worse.status_code, 200)

        # Check server returns bestTime = 18
        res_prog = self.client.get('/api/progress')
        self.assertEqual(res_prog.status_code, 200)
        lvl_data = res_prog.get_json()['data']['levels']['1']
        self.assertEqual(lvl_data['bestTime'], 18)
        self.assertEqual(lvl_data['bestMoves'], 10)

        # Replay with better time (12s < 18s)
        res_lvl_better = self.client.post('/api/progress/level', json={
            'levelId': 1,
            'completed': True,
            'time': 12,
            'moves': 8,
            'grade': 'S'
        })
        self.assertEqual(res_lvl_better.status_code, 200)

        # Check server updated bestTime = 12
        res_prog_2 = self.client.get('/api/progress')
        lvl_data_2 = res_prog_2.get_json()['data']['levels']['1']
        self.assertEqual(lvl_data_2['bestTime'], 12)
        self.assertEqual(lvl_data_2['bestMoves'], 8)

        # 9. Challenge Progress recording
        res_ch = self.client.post('/api/progress/challenge', json={
            'challengeId': 'time_trial_01',
            'completed': True,
            'score': 'S'
        })
        self.assertEqual(res_ch.status_code, 200)

        # 10. Profile fetching
        res_prof = self.client.get('/api/profile')
        self.assertEqual(res_prof.status_code, 200)
        prof_data = res_prof.get_json()['data']
        self.assertGreaterEqual(prof_data['derivedStats']['levelsCompleted'], 1)

        # 11. Reset progress
        res_reset = self.client.post('/api/progress/reset')
        self.assertEqual(res_reset.status_code, 200)

        res_prog_reset = self.client.get('/api/progress')
        lvl_1_reset = res_prog_reset.get_json()['data']['levels']['1']
        self.assertTrue(lvl_1_reset['unlocked'])
        self.assertFalse(lvl_1_reset['completed'])

if __name__ == '__main__':
    unittest.main()
