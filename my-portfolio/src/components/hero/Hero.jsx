import FadeContent from "../ui/FadeContent"

export default function Hero() {
  return (
      <div className="grid grid-cols-[1.2fr_1fr] w-full min-h-screen box-border relative max-[900px]:grid-cols-1 max-[900px]:h-auto max-[900px]:min-h-screen">
        <FadeContent
            blur={true}
            duration={1000}
            easing="ease-out"
            initialOpacity={0}
            delay={0}
            className="grid grid-rows-[auto_auto_1fr] gap-4 pt-12 pr-[clamp(1.5rem,5vw,3rem)] pb-8 pl-[clamp(1.5rem,5vw,3rem)] min-w-[350px] max-[900px]:min-w-0 max-[900px]:p-8 max-[900px]:pb-8"
        >
          <h1
              className="hero-title font-sans font-[75] tracking-[0.03em] m-0 mb-2 leading-[1.1] text-left"
              style={{ color: "#c0b5c9" }}
          >
            Anthony Lam
          </h1>
          <div className="hero-subtitle font-sans font-normal mb-10 text-left"
               style={{ color: "#827a87" }}>
            Aspiring Software Engineer
          </div>
          <nav className="mt-8">
            <ul className="list-none p-0 m-0 text-left">
              <li
                  className="hero-nav font-sans font-bold mb-[1.1rem] tracking-[0.01em] text-left"
                  style={{ color: "#c0b5c9" }}
              >
                <a href="#about" className="menu-link no-underline font-bold text-left"
                   style={{ color: "#c0b5c9" }}>
                  About
                </a>
              </li>
              <li
                  className="hero-nav font-sans font-bold mb-[1.1rem] tracking-[0.01em] text-left"
                  style={{ color: "#c0b5c9" }}
              >
                <a href="#projects" className="menu-link no-underline font-bold text-left"
                   style={{ color: "#c0b5c9" }}>
                  Projects
                </a>
              </li>
              <li
                  className="hero-nav font-sans font-bold mb-[1.1rem] tracking-[0.01em] text-left"
                  style={{ color: "#c0b5c9" }}
              >
                <a href="#experience" className="menu-link no-underline font-bold text-left"
                   style={{ color: "#c0b5c9" }}>
                  Experience
                </a>
              </li>
              <li
                  className="hero-nav font-sans font-bold mb-[1.1rem] tracking-[0.01em] text-left"
                  style={{ color: "#c0b5c9" }}
              >
                <a href="#contact" className="menu-link no-underline font-bold text-left"
                   style={{ color: "#c0b5c9" }}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </FadeContent>

        <FadeContent
            blur={true}
            duration={1000}
            easing="ease-out"
            initialOpacity={0}
            delay={200}
            className="grid place-items-end p-0 pr-[clamp(1.5rem,5vw,3rem)] pb-12 pl-[clamp(1.5rem,5vw,3rem)] min-w-[320px] relative max-[900px]:min-w-0 max-[900px]:p-8 max-[900px]:pb-8 max-[900px]:place-items-start"
        >
          <div
              className="hero-bio font-sans font-normal max-w-none text-left"
              style={{ color: "#c0b5c9" }}
          >
            <p>
              <strong className="font-bold">
                Born in 2004
                <br />
                Niagara, Canada.
              </strong>
              <br />
              Passionate about Backend and Cloud Computing.
              <br />I believe robust Backend systems are the backbone
              <br />
              of every great application.
              <br />
              My mission: build scalable, reliable solutions
              <br />
              that power growth and never let you down.
              <br />
            </p>
          </div>
        </FadeContent>
      </div>
  )
}
