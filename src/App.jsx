import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageHeader from './components/PageHeader';
import { appRoutes } from './configs/routes/routes.config';

function App() {
    return (
        <BrowserRouter>
            <PageHeader />
            <Suspense fallback={null}>
                <Routes>
                    {appRoutes.map((route) => {
                        const Component = route.component;
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