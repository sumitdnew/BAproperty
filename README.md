# BA Property Manager

A comprehensive property management system built with React, TypeScript, and Supabase, designed to streamline property management operations for building administrators, property managers, building owners, and tenants.

## 🏗️ Project Overview

BA Property Manager is a modern web application that provides a complete solution for property management, including tenant management, maintenance requests, payment tracking, community features, and administrative tools.

## ✨ Features

### 🔐 Authentication & User Management
- **Multi-role User System**: Support for 4 distinct user types
  - **Administrators**: Full system access and management
  - **Property Managers**: Building operations and maintenance management
  - **Building Owners**: Property ownership and financial oversight
  - **Tenants**: Rental management and community access
- **Secure Authentication**: Powered by Supabase Auth
- **Role-based Access Control**: Different interfaces and permissions per user type

### 🏢 Property Management
- **Building Management**: Multiple buildings with detailed information
- **Apartment Management**: 24 apartments per building with occupancy tracking
- **Tenant Management**: Complete tenant profiles with lease agreements
- **Maintenance Requests**: Priority-based maintenance tracking system
- **Payment Processing**: Rent collection and payment tracking

### 💰 Financial Management
- **Payment Tracking**: Rent payments with status monitoring
- **Expense Management**: Building expenses and cost tracking
- **Lease Agreements**: Digital lease management
- **Payment Receipts**: Automated receipt generation

### 🛠️ Maintenance System
- **Request Management**: Submit and track maintenance requests
- **Priority Levels**: Urgent, High, Medium, Low priority classification
- **Status Tracking**: Pending, In Progress, Completed status updates
- **Assignment System**: Assign maintenance tasks to staff
- **Cost Estimation**: Track estimated and actual maintenance costs

### 👥 Community Features
- **Community Posts**: Building-wide announcements and discussions
- **Post Categories**: Meeting, Maintenance, Social content organization
- **Comments & Likes**: Interactive community engagement
- **Pinned Posts**: Important announcements highlighting

### 📧 Communication System
- **Invitation System**: Tenant invitation management
- **Notifications**: Real-time notification system
- **Document Management**: File upload and sharing capabilities
- **Status Tracking**: Invitation acceptance/decline tracking

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Key metrics and performance indicators
- **Financial Reports**: Payment and expense analytics
- **Occupancy Reports**: Building occupancy statistics
- **Maintenance Analytics**: Request patterns and response times

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React i18next**: Internationalization support

### Backend & Database
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Relational database
- **Row Level Security (RLS)**: Database-level security
- **Real-time Subscriptions**: Live data updates

### UI/UX
- **Heroicons**: Beautiful SVG icons
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface
- **Dark/Light Mode**: Theme support (planned)

## 📁 Project Structure

```
ba-property-manager/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── LoginForm.tsx
│   │   ├── Dashboard/
│   │   │   └── StatsCard.tsx
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Sidebar.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Maintenance.tsx
│   │   ├── Tenants.tsx
│   │   ├── Payments.tsx
│   │   ├── Analytics.tsx
│   │   ├── Invitations.tsx
│   │   └── Community.tsx
│   ├── lib/
│   │   ├── i18n.ts
│   │   └── supabase.ts
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── SQL-SETUP/
│   ├── complete-database-setup.sql
│   └── sample-data-insert.sql
├── public/
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🗄️ Database Schema

### Core Tables
- **buildings**: Building information and details
- **user_profiles**: User profile data with role management
- **apartments**: Apartment details and occupancy status
- **tenants**: Tenant information and lease details
- **maintenance_requests**: Maintenance request tracking
- **payments**: Payment records and status
- **invitations**: Tenant invitation management
- **community_posts**: Community announcements and discussions

### Supporting Tables
- **building_amenities**: Building facilities and amenities
- **expenses**: Building expense tracking
- **notifications**: User notification system
- **lease_agreements**: Digital lease management
- **documents**: File management system
- **payment_receipts**: Payment receipt generation
- **maintenance_assignments**: Task assignment tracking
- **community_post_comments**: Post interaction system
- **community_post_likes**: Post engagement tracking

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sumitdnew/BAproperty.git
   cd ba-property-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Get your project URL and anon key
   - Update `src/lib/supabase.ts` with your credentials

4. **Set up the database**
   ```bash
   # Run the complete database setup
   psql -f SQL-SETUP/complete-database-setup.sql
   
   # Insert sample data
   psql -f SQL-SETUP/sample-data-insert.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Configuration
The application uses Supabase with the following key features:
- **Row Level Security (RLS)**: Database-level security policies
- **Real-time subscriptions**: Live data updates
- **Authentication**: Built-in user management
- **Storage**: File upload and management

## 👥 User Roles & Permissions

### Administrator
- Full system access
- User management
- Building configuration
- Financial oversight
- System analytics

### Property Manager
- Building operations
- Maintenance management
- Tenant communication
- Payment processing
- Community management

### Building Owner
- Property oversight
- Financial reports
- Tenant management
- Maintenance approval
- Community participation

### Tenant
- Maintenance requests
- Payment management
- Community access
- Document access
- Communication tools

## 🌐 Internationalization

The application supports multiple languages through React i18next:
- **English**: Primary language
- **Spanish**: Secondary language support
- **Extensible**: Easy to add more languages

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security Features

- **Authentication**: Secure user authentication via Supabase
- **Authorization**: Role-based access control
- **Data Protection**: Row Level Security (RLS)
- **Input Validation**: Client and server-side validation
- **HTTPS**: Secure data transmission

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core property management features
- ✅ User authentication and roles
- ✅ Basic maintenance system
- ✅ Payment tracking

### Phase 2 (Planned)
- 🔄 Advanced analytics dashboard
- 🔄 Mobile application
- 🔄 API documentation
- 🔄 Advanced reporting

### Phase 3 (Future)
- 📋 AI-powered maintenance predictions
- 📋 Integration with external services
- 📋 Advanced financial tools
- 📋 Multi-language support expansion

## 📊 Current Status

- **Frontend**: ✅ Complete with React + TypeScript
- **Backend**: ✅ Supabase integration
- **Database**: ✅ PostgreSQL with comprehensive schema
- **Authentication**: ✅ Multi-role user system
- **UI/UX**: ✅ Modern, responsive design
- **Internationalization**: ✅ Multi-language support
- **Documentation**: ✅ Comprehensive README and setup guides

## 🎯 Key Achievements

- **Complete Property Management System**: All essential features implemented
- **Multi-role Architecture**: Support for 4 distinct user types
- **Modern Tech Stack**: React 18, TypeScript, Supabase, Tailwind CSS
- **Comprehensive Database**: 17 tables with proper relationships
- **Real-time Features**: Live updates and notifications
- **Production Ready**: Clean code, proper error handling, responsive design

---

**Built with ❤️ for efficient property management**
