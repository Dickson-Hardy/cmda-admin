import AppRouter from "./routes/AppRouter";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/Global/ErrorBoundary/ErrorBoundary";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="w-full h-screen flex items-center justify-center">
            <h2 className="font-bold text-xl">Loading...</h2>
          </div>
        }
        persistor={persistor}
      >
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </PersistGate>
    </Provider>
  );
}
