import { useRouteError } from "react-router-dom";

export default function ErrorElement() {
  const error = useRouteError();
  const _404 = error?.status === 404;

  return (
    <section className="h-[60vh] flex flex-col justify-center">
      <div className="max-w-screen-md mx-auto p-8">
        <h2 className="text-2xl md:text-4xl font-black text-ink mt-4">
          Oops! <span>💔</span> <br /> {_404 ? "This page does not exist" : "Something went wrong"}.
        </h2>
        <div className="text-primary font-mono inline-block w-auto font-semibold font-italic bg-primary/20 rounded-lg py-4 px-6 text-sm my-4">
          {_404 ? window.location.href : error?.statusText || error?.message}
        </div>
        <p className="text-base mb-4 font-medium">
          {_404
            ? `Please check the URL or navigate to another page.`
            : `Don't you fret, our team of super engineers are working on it!`}
        </p>
      </div>
    </section>
  );
}
