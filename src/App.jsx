import VenomButton from "./buttons/VenomButton";
import MagicRings from "./components/MagicRings";
import Services from "./components/Services";
import SloshButton from "./components/SloshButton";
import TinctureSlosh from "./components/TinctureSlosh";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect } from "react";
import WhyChooseUs from "./components/WhyChooseUs";
import Team from "./components/Team";
import Contact from "./components/Contact";
import SolarSystem from "./components/SolarSystem";
import Project from "./components/Project";
import { Route, Routes } from "react-router-dom";
import { ProjectListing } from "./pages/ProjectListing";
import Footer from "./components/Footer";
function App() {
  function Counter({ value, suffix, delay }) {
    const count = useMotionValue(0);

    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
      const controls = animate(count, value, {
        duration: 2,
        delay,
        ease: [0.16, 1, 0.3, 1],
      });

      return () => controls.stop();
    }, [count, value, delay]);

    return (
      <p className="text-2xl font-semibold flex">
        <motion.span>{rounded}</motion.span>
        <span>{suffix}</span>
      </p>
    );
  }
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* hero section  */}

              <div className="h-screen relative bg-black ">
                <MagicRings
                  color="#009966"
                  colorTwo="#009966 "
                  ringCount={5}
                  speed={0.4}
                  glow={1.2}
                  dispersion={0.15}
                  followMouse={true}
                  clickBurst={true}
                />

                <div className="content-container w-[90%] text-center text-white absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] ">
                  <motion.h1
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.18,
                          delayChildren: 0.2,
                        },
                      },
                    }}
                    className="text-white text-[80px] font-medium text-center"
                  >
                    {["IDEAS.", "DESIGN.", "DEVELOPMENT."].map((word, i) => (
                      <motion.span
                        key={i}
                        className="inline-block mr-5"
                        variants={{
                          hidden: {
                            y: 100,
                            opacity: 0,
                            rotateX: -60,
                            filter: "blur(10px)",
                          },
                          visible: {
                            y: 0,
                            opacity: 1,
                            rotateX: 0,
                            filter: "blur(0px)",
                            transition: {
                              duration: 1,
                              ease: [0.16, 1, 0.3, 1],
                            },
                          },
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      delay: 0.9,
                      duration: 1,
                      ease: "easeOut",
                    }}
                    className="text-gray-100 w-[60%] m-auto"
                  >
                    We turn ideas into impactful digital experiences. From
                    stunning websites to powerful web applications, we help
                    businesses build, evolve, and grow online.
                  </motion.p>

                  <div className="button-container mt-4 flex gap-2 m-auto w-fit">
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.3 }}
                    >
                      <SloshButton
                        label="Start a project"
                        width={172}
                        base="#000000"
                        dye="#3d3d3d"
                        textColor="#ffffff"
                        glow={45}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 1.4, duration: 0.3 }}
                    >
                      <SloshButton
                        label="Explore Our Work"
                        width={172}
                        base="#ffffff"
                        dye="#ebebeb"
                        textColor="#000000"
                        glow={45}
                      />
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.2,
                        delayChildren: 1.5,
                      },
                    },
                  }}
                  className="count-container text-white absolute left-6 bottom-4 flex gap-8"
                >
                  {[
                    { label: "Experience", value: 3, suffix: "+" },
                    { label: "Technologies Mastered", value: 10, suffix: "+" },
                    { label: "Dedicated Support", value: 24, suffix: "/7" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 40,
                          filter: "blur(10px)",
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                          transition: {
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        },
                      }}
                      className="w-fit"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{
                          delay: 1.8 + index * 0.2,
                          duration: 0.7,
                        }}
                        className="h-[1px] bg-[#1f1f1f] mb-3"
                      />

                      <p className="text-gray-500 text-sm mb-1">{item.label}</p>

                      <Counter
                        value={item.value}
                        suffix={item.suffix}
                        delay={1.8 + index * 0.2}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, Y: 60, filter: "blur(8px)" }}
                  animate={{ opacity: 1, Y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 1.7, duration: 1.2 }}
                  className="count-container text-gray-400 absolute right-2 bottom-4 flex gap-6 w-[40%] text-[14px]"
                >
                  <p>
                    A creative team building modern websites and digital
                    solutions with purpose, precision, and a passion for
                    innovation.
                  </p>
                </motion.div>
              </div>

              {/* services    */}
              <Services />

              {/* why choose us  */}
              <WhyChooseUs />

              {/* Team  */}
              <Team />

              {/* technologies  */}
              <SolarSystem
                title="Technologies We Work With"
                description="From frontend to backend, we use modern technologies to deliver scalable and reliable digital solutions."
              />

              {/* Projects */}
              <Project />
              {/* Contact  */}
              <Contact />

              <Footer />
            </>
          }
        />

        <Route path="/projects" element={<ProjectListing />} />
      </Routes>
    </>
  );
}

export default App;
