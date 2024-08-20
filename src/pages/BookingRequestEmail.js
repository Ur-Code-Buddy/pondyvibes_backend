import React from 'react';
import { Html, Head, Preview, Body, Container, Heading, Text, Section, Row, Column } from '@react-email/components';

export const BookingRequestEmail = ({ data }) => {
  const {
    firstName,
    lastName,
    emailAddress,
    phoneNumber,
    dateOfStayFrom,
    dateOfStayTo,
    numberOfPersons,
    numberOfRooms,
    roomType,
    additionalInfo,
  } = data;

  return (
    <Html>
      <Head />
      <Preview>Booking Request from {firstName} {lastName}</Preview>
      <Body style={main}>
        <Container>
          <Heading style={heading}>Booking Request</Heading>
          <Section>
            <Text style={text}><strong>First Name:</strong> {firstName}</Text>
            <Text style={text}><strong>Last Name:</strong> {lastName}</Text>
            <Text style={text}><strong>Email Address:</strong> {emailAddress}</Text>
            <Text style={text}><strong>Phone Number:</strong> {phoneNumber}</Text>
            <Text style={text}><strong>Date of Stay (From):</strong> {new Date(dateOfStayFrom).toLocaleString()}</Text>
            <Text style={text}><strong>Date of Stay (To):</strong> {new Date(dateOfStayTo).toLocaleString()}</Text>
            <Text style={text}><strong>Number of Persons:</strong> {numberOfPersons}</Text>
            <Text style={text}><strong>Number of Rooms:</strong> {numberOfRooms}</Text>
            <Text style={text}><strong>Room Type:</strong> {roomType}</Text>
            <Text style={text}><strong>Additional Information / Special Requests:</strong> {additionalInfo}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f4f4f4',
  fontFamily: 'Arial, sans-serif',
  padding: '20px',
};

const heading = {
  fontSize: '24px',
  color: '#333',
  marginBottom: '20px',
};

const text = {
  fontSize: '16px',
  color: '#333',
  lineHeight: '1.5',
  marginBottom: '10px',
};
