import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import CreateNewSpot from './components/Navigation/CreateNewSpot';
import SpotDetails from './components/SpotDetails/SpotDetails';
import Spots from './components/AllSpots/Spots';
import ManageSpots from './components/ManageSpots/ManageSpots';
import UpdateSpotForm from './components/ManageSpots/UpdateSpotForm';
import * as sessionActions from './store/session';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Spots />,
      },
      {
        path: '/spots/new',
        element: <CreateNewSpot />,
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />,
      },
      {
        path: '/spots/current',
        element: <ManageSpots />,
      },
      {
        path: '/spots/:spotId/edit',
        element: <UpdateSpotForm />,
      },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
