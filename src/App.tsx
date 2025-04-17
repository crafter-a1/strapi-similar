
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CMSLayout } from "./components/layout/CMSLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import ContentTypes from "./pages/ContentTypes";
import ContentTypeCreate from "./pages/ContentTypeCreate";
import ContentTypeEdit from "./pages/ContentTypeEdit";
import ContentManager from "./pages/ContentManager";
import ContentEntryEdit from "./pages/ContentEntryEdit";
import ContentEntryCreate from "./pages/ContentEntryCreate";
import Components from "./pages/Components";
import MediaLibrary from "./pages/MediaLibrary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* CMS Routes - Wrapped in Layout */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<CMSLayout><Dashboard /></CMSLayout>} />

          {/* Content Type Builder Routes */}
          <Route path="/content-types" element={<CMSLayout><ContentTypes /></CMSLayout>} />
          <Route path="/content-types/create" element={<CMSLayout><ContentTypeCreate /></CMSLayout>} />
          <Route path="/content-types/edit/:id" element={<CMSLayout><ContentTypeEdit /></CMSLayout>} />

          {/* Content Manager Routes */}
          <Route path="/content-manager" element={<CMSLayout><ContentManager /></CMSLayout>} />
          <Route path="/content-manager/:collectionId" element={<CMSLayout><ContentManager /></CMSLayout>} />
          <Route path="/content-manager/:collectionId/create" element={<CMSLayout><ContentEntryCreate /></CMSLayout>} />
          <Route path="/content-manager/:collectionId/edit/:entryId" element={<CMSLayout><ContentEntryEdit /></CMSLayout>} />

          {/* Components Routes */}
          <Route path="/components" element={<CMSLayout><Components /></CMSLayout>} />

          {/* Media Library Routes */}
          <Route path="/media-library" element={<CMSLayout><MediaLibrary /></CMSLayout>} />

          {/* Settings Routes - Placeholder */}
          <Route path="/settings" element={<CMSLayout><div className="p-8 text-center">Settings (Coming Soon)</div></CMSLayout>} />

          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
