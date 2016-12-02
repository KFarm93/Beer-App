--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.0
-- Dumped by pg_dump version 9.6.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: auth_token; Type: TABLE; Schema: public; Owner: robertdunn
--

CREATE TABLE auth_token (
    token text NOT NULL,
    token_expires timestamp without time zone DEFAULT (now() + '30 days'::interval),
    users_id integer
);


ALTER TABLE auth_token OWNER TO robertdunn;

--
-- Name: beer; Type: TABLE; Schema: public; Owner: robertdunn
--

CREATE TABLE beer (
    id integer NOT NULL,
    name text,
    description text,
    image_path text,
    brewery text,
    style text,
    abv character varying,
    ibu integer
);


ALTER TABLE beer OWNER TO robertdunn;

--
-- Name: beer_in_cellar; Type: TABLE; Schema: public; Owner: robertdunn
--

CREATE TABLE beer_in_cellar (
    id integer NOT NULL,
    beer_id integer,
    user_id integer
);


ALTER TABLE beer_in_cellar OWNER TO robertdunn;

--
-- Name: users; Type: TABLE; Schema: public; Owner: robertdunn
--

CREATE TABLE users (
    id integer NOT NULL,
    username text,
    email text,
    password text,
    first_name text,
    last_name text
);


ALTER TABLE users OWNER TO robertdunn;

--
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: robertdunn
--

CREATE SEQUENCE customer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE customer_id_seq OWNER TO robertdunn;

--
-- Name: customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robertdunn
--

ALTER SEQUENCE customer_id_seq OWNED BY users.id;


--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: robertdunn
--

CREATE SEQUENCE product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE product_id_seq OWNER TO robertdunn;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robertdunn
--

ALTER SEQUENCE product_id_seq OWNED BY beer.id;


--
-- Name: product_in_purchase_id_seq; Type: SEQUENCE; Schema: public; Owner: robertdunn
--

CREATE SEQUENCE product_in_purchase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE product_in_purchase_id_seq OWNER TO robertdunn;

--
-- Name: product_in_purchase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robertdunn
--

ALTER SEQUENCE product_in_purchase_id_seq OWNED BY beer_in_cellar.id;


--
-- Name: users_trade_beer; Type: TABLE; Schema: public; Owner: robertdunn
--

CREATE TABLE users_trade_beer (
    id integer NOT NULL,
    user_one integer,
    user_two integer,
    user_one_beer integer,
    user_two_beer integer
);


ALTER TABLE users_trade_beer OWNER TO robertdunn;

--
-- Name: users_trade_beer_id_seq; Type: SEQUENCE; Schema: public; Owner: robertdunn
--

CREATE SEQUENCE users_trade_beer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_trade_beer_id_seq OWNER TO robertdunn;

--
-- Name: users_trade_beer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robertdunn
--

ALTER SEQUENCE users_trade_beer_id_seq OWNED BY users_trade_beer.id;


--
-- Name: beer id; Type: DEFAULT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY beer ALTER COLUMN id SET DEFAULT nextval('product_id_seq'::regclass);


--
-- Name: beer_in_cellar id; Type: DEFAULT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY beer_in_cellar ALTER COLUMN id SET DEFAULT nextval('product_in_purchase_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('customer_id_seq'::regclass);


--
-- Name: users_trade_beer id; Type: DEFAULT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY users_trade_beer ALTER COLUMN id SET DEFAULT nextval('users_trade_beer_id_seq'::regclass);


--
-- Name: auth_token auth_token_pkey; Type: CONSTRAINT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY auth_token
    ADD CONSTRAINT auth_token_pkey PRIMARY KEY (token);


--
-- Name: users customer_pkey; Type: CONSTRAINT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY users
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: beer_in_cellar product_in_purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY beer_in_cellar
    ADD CONSTRAINT product_in_purchase_pkey PRIMARY KEY (id);


--
-- Name: beer product_pkey; Type: CONSTRAINT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY beer
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: users_trade_beer users_trade_beer_pkey; Type: CONSTRAINT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY users_trade_beer
    ADD CONSTRAINT users_trade_beer_pkey PRIMARY KEY (id);


--
-- Name: users_trade_beer users_trade_beer_user_one_beer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY users_trade_beer
    ADD CONSTRAINT users_trade_beer_user_one_beer_fkey FOREIGN KEY (user_one_beer) REFERENCES beer(id);


--
-- Name: users_trade_beer users_trade_beer_user_one_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY users_trade_beer
    ADD CONSTRAINT users_trade_beer_user_one_fkey FOREIGN KEY (user_one) REFERENCES users(id);


--
-- Name: users_trade_beer users_trade_beer_user_two_beer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY users_trade_beer
    ADD CONSTRAINT users_trade_beer_user_two_beer_fkey FOREIGN KEY (user_two_beer) REFERENCES beer(id);


--
-- Name: users_trade_beer users_trade_beer_user_two_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robertdunn
--

ALTER TABLE ONLY users_trade_beer
    ADD CONSTRAINT users_trade_beer_user_two_fkey FOREIGN KEY (user_two) REFERENCES users(id);


--
-- PostgreSQL database dump complete
--

