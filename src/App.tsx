import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageHeader from './components/PageHeader';
import { appRoutes } from './configs/routes/routes.config';
import { Meta } from './@types/routes';

function App() {
    return (
        <BrowserRouter>
            <PageHeader />
            <Suspense fallback={null}>
                <Routes>
                    {appRoutes.map((route) => {
                        const Component = route.component as React.ComponentType<Meta>;
                        return (
                            <Route
                                key={route.key}
                                path={route.path}
                                element={<Component {...(route.meta || {})} />}
                            />
                        );
                    })}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;