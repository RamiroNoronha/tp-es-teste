import { Router } from 'express';
import { getUsers, createUser, getUserById, updateUser, deleteUser, loginUser } from '../controllers/userController';
import { DataSource } from 'typeorm';

const createUserRoutes = (dataSource: DataSource) => {
  const router = Router();

  router.get('/users', getUsers(dataSource));
  router.post('/users', createUser(dataSource));
  router.get('/users/:id', getUserById(dataSource));
  router.put('/users/:id', updateUser(dataSource));
  router.delete('/users/:id', deleteUser(dataSource));
  router.post('/login', loginUser(dataSource));

  return router;
};

export default createUserRoutes;