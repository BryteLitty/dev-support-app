'use client'
import Head from "next/head";
import Image from "next/image";
import { useState, useRef } from "react";
import Navbar from "./components/Navbar";
import Form from "./components/Form";
import AuthChatModal from "./components/AuthChatModal";

export default function Home() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Navbar />
      <div className="w-auto">
        <Form />
      </div>
    </>
  )
}
