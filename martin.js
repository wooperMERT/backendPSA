import React, { useEffect, useState } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export const CrisisPage = () => {
  const [newsArticles, setNewsArticles] = useState([]);

  // Fetching crisis-related news data (assuming using a news API)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=crisis&apiKey=925e84534f414b00923ae341b365c582`
        );
        const data = await response.json();
        console.log("Fetched articles: ", data.articles); // Log the fetched articles
        setNewsArticles(data.articles);
      } catch (error) {
        console.error("Error fetching crisis news:", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <HelmetProvider>
      <Container className="CrisisPage-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title> Crisis | CrisisPage</title>
          <meta name="description" content="Latest crisis news updates" />
        </Helmet>

        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4">Crisis News</h1>
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>

        <Row className="sec_sp">
          <Col lg="12">
            {newsArticles.length > 0 ? (
              newsArticles.map((article, index) => (
                <div key={index} className="news-article mb-4">
                  <div className="news-header">
                    <h3 className="d-inline-block">{article.title}</h3>
                    {/* Add console logging to track the routing */}
                    {console.log(`Routing to: /ports-affected/${index} with state:`, article.title)}
                    <Link
                      to={`/ports-affected/${index}`}
                      state={{ articleTitle: article.title }}
                      className="ml-3"
                    >
                      <Button variant="primary" className="btn-small ml-3">
                        Ports affected by this crisis
                      </Button>
                    </Link>
                  </div>
                  <p>{article.description}</p>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read more
                  </a>
                </div>
              ))
            ) : (
              <p>No news articles available</p>
            )}
          </Col>
        </Row>
      </Container>
    </HelmetProvider>
  );
};
