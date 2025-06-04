import React from "react";
import { Helmet } from "react-helmet";

const About: React.FC = () => {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Value Life Marketing</title>
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <meta content="" name="keywords" />
        <meta content="" name="description" />

        {/* Favicon */}
        <link href="img/logo.png" rel="icon" />

        {/* Google Web Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Icon Font Stylesheet */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css"
          rel="stylesheet"
        />

        {/* Libraries Stylesheet */}
        <link href="lib/animate/animate.min.css" rel="stylesheet" />
        <link
          href="lib/owlcarousel/assets/owl.carousel.min.css"
          rel="stylesheet"
        />
        <link href="lib/lightbox/css/lightbox.min.css" rel="stylesheet" />

        {/* Customized Bootstrap Stylesheet */}
        <link href="css/bootstrap.min.css" rel="stylesheet" />

        {/* Template Stylesheet */}
        <link href="css/style.css" rel="stylesheet" />
      </Helmet>

      {/* Facts Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="fact-item bg-light rounded text-center h-100 p-5">
                <i className="fa fa-certificate fa-4x text-primary mb-4"></i>
                <h5 className="mb-3">Years Experience</h5>
                <h1 className="display-5 mb-0" data-toggle="counter-up">
                  20
                </h1>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
              <div className="fact-item bg-light rounded text-center h-100 p-5">
                <i className="fa fa-users-cog fa-4x text-primary mb-4"></i>
                <h5 className="mb-3">Team Members</h5>
                <h1 className="display-5 mb-0" data-toggle="counter-up">
                  100
                </h1>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
              <div className="fact-item bg-light rounded text-center h-100 p-5">
                <i className="fa fa-users fa-4x text-primary mb-4"></i>
                <h5 className="mb-3">Satisfied Clients</h5>
                <h1 className="display-5 mb-0" data-toggle="counter-up">
                  100
                </h1>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.7s">
              <div className="fact-item bg-light rounded text-center h-100 p-5">
                <i className="fa fa-check fa-4x text-primary mb-4"></i>
                <h5 className="mb-3">Total Distributors</h5>
                <h1 className="display-5 mb-0" data-toggle="counter-up">
                  70
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Facts End */}

      {/* Feature Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="h-100">
                <h6 className="section-title bg-white text-start text-primary pe-3">
                  Why Choose Us
                </h6>
                <h1 className="display-6 mb-4">
                  Why People Trust Us? Learn About Us!
                </h1>
                <p className="mb-4">
                  People trust us because we prioritize quality in every product
                  and service we offer. Our transparent approach, proven
                  leadership, and customer-first values build strong
                  credibility. We empower individuals through health-focused
                  solutions and income-generating opportunities. At Value Life,
                  trust is earned through consistent excellence and commitment.
                </p>
                <div className="row g-4">
                  <div className="col-12">
                    <div className="skill">
                      <div className="d-flex justify-content-between">
                        <p className="mb-2">Trust</p>
                        <p className="mb-2">90%</p>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          aria-valuenow={85}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="skill">
                      <div className="d-flex justify-content-between">
                        <p className="mb-2">Quality.</p>
                        <p className="mb-2">95%</p>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          aria-valuenow={90}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="skill">
                      <div className="d-flex justify-content-between">
                        <p className="mb-2">Empowerment</p>
                        <p className="mb-2">100%</p>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          aria-valuenow={95}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.5s">
              <div className="img-border">
                <img className="img-fluid" src="img/feature.jpg" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Feature End */}

      {/* About Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="img-border">
                <img className="img-fluid" src="img/about.jpg" alt="" />
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.5s">
              <div className="h-100">
                <h6 className="section-title bg-white text-start text-primary pe-3">
                  About Us
                </h6>
                <h1 className="display-6 mb-4">
                  About <span className="text-primary">Value Life</span>{" "}
                  Marketing Pvt. Ltd.
                </h1>
                <p>
                  Value Life Marketing Pvt. Ltd. is a company committed to
                  promoting health, wealth, and well-being through innovative
                  products like alkaline water purifiers and bio-magnetic
                  mattress beds. Founded with the vision of empowering
                  individuals, it operates on a mission to transform 100,000
                  people into millionaires.
                </p>
                <p className="mb-4">
                  The leadership team brings decades of experience in direct
                  selling, network marketing, and customer service. The company
                  offers a zero-registration fee affiliate program with lifetime
                  validity. Its core values include customer obsession,
                  innovation, empowerment, and sustainability. Value Life aims
                  to revolutionize lives through quality products and a
                  rewarding business model.
                </p>
                <div className="d-flex align-items-center mb-4 pb-2">
                  <img
                    className="flex-shrink-0 rounded-circle"
                    src="img/jamal.png"
                    alt=""
                    style={{ width: "50px", height: "50px" }}
                  />
                  <div className="ps-4">
                    <h6>JAMRODDIN SHEK</h6>
                    <small>FOUNDER & MD</small>
                  </div>
                </div>
                <a
                  className="btn btn-primary rounded-pill py-3 px-5"
                  href="contact.html"
                >
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Back to Top */}
      <a
        href="#"
        className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top"
      >
        <i className="bi bi-arrow-up"></i>
      </a>
    </>
  );
};

export default About;
